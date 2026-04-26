// Animated dithered-noise background. Self-contained: generates an fBm wave
// pattern, then applies one of four rendering modes (bayer, floyd/riemersma,
// dots/halftone, ascii) in a single fragment pass.

import { program, quadVAO, createTex, parseColor } from './gl';
import { VERT } from './shaders/vertex';
import { BAYER8 } from './shaders/bayerConst';
import { buildAtlas } from './atlas';
import type { DitherMode } from './types';

const WAVE_FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o_frag;

uniform vec2  u_res;
uniform float u_time;
uniform float u_waveSpeed;
uniform float u_waveFrequency;
uniform float u_waveAmplitude;
uniform vec3  u_waveColor;
uniform vec3  u_baseColor;
uniform float u_pixelSize;
uniform float u_colorNum;
uniform vec2  u_mouse;
uniform float u_mouseEnabled;
uniform float u_mouseRadius;
uniform int   u_mode;        // 0 bayer · 1 floyd · 2 dots · 3 ascii
uniform float u_matrixSize;  // 2 | 4 | 8
uniform sampler2D u_atlas;
uniform float u_charCount;

vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float amp = 1.0;
  for (int i = 0; i < 4; i++) {
    v += amp * abs(cnoise(p));
    p *= u_waveFrequency;
    amp *= u_waveAmplitude;
  }
  return v;
}
float pattern(vec2 p){
  vec2 q = p - u_time * u_waveSpeed;
  return fbm(p + fbm(q));
}

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

${BAYER8}

// Sample the wave at cell-centre coords so each dither cell draws one value.
float sampleWave(vec2 snappedUV){
  vec2 p = snappedUV - 0.5;
  p.x *= u_res.x / u_res.y;
  float f = pattern(p);
  if (u_mouseEnabled > 0.5) {
    vec2 mN = (u_mouse / u_res - 0.5);
    mN.y = -mN.y;
    mN.x *= u_res.x / u_res.y;
    float d = length(p - mN);
    float e = 1.0 - smoothstep(0.0, u_mouseRadius, d);
    f -= 0.5 * e;
  }
  return clamp(f, 0.0, 1.0);
}

void main(){
  vec2 px = u_pixelSize / u_res;
  vec2 snappedUV = px * floor(v_uv / px);
  vec2 cell = floor(v_uv * u_res / u_pixelSize);

  float f = sampleWave(snappedUV);
  vec3 col = mix(u_baseColor, u_waveColor, f);

  // ----- bayer (default) -----
  if (u_mode == 0) {
    float threshold = bayerN(cell, u_matrixSize) * 0.5;
    float step = 1.0 / max(u_colorNum - 1.0, 1.0);
    vec3 c = col + vec3(threshold) * step;
    c = clamp(c - 0.15, 0.0, 1.0);
    c = floor(c * (u_colorNum - 1.0) + 0.5) / (u_colorNum - 1.0);
    o_frag = vec4(c, 1.0);
    return;
  }

  // ----- floyd / riemersma approximation -----
  if (u_mode == 1) {
    float n = hash(cell + u_time * 13.0) - 0.5;
    float b = bayerN(cell, u_matrixSize) * 0.4;
    float threshold = (n * 0.65 + b) * 0.9;
    float step = 1.0 / max(u_colorNum - 1.0, 1.0);
    vec3 c = col + vec3(threshold) * step;
    c = clamp(c, 0.0, 1.0);
    c = floor(c * (u_colorNum - 1.0) + 0.5) / (u_colorNum - 1.0);
    o_frag = vec4(c, 1.0);
    return;
  }

  // ----- dots / halftone -----
  if (u_mode == 2) {
    float ang = radians(15.0);
    float cs = cos(ang), sn = sin(ang);
    mat2 rot = mat2(cs, -sn, sn, cs);
    // Centre + correct aspect FIRST so dots stay circular in screen space,
    // THEN rotate, THEN scale uniformly. (Scaling non-uniformly before
    // rotating skews the grid into a parallelogram on portrait viewports —
    // visible as the whole image looking tilted on phones.)
    vec2 uvCentered = v_uv - 0.5;
    uvCentered.x *= u_res.x / u_res.y;
    float dotsAcross = u_res.y / (u_pixelSize * 2.0);
    vec2 p = rot * uvCentered * dotsAcross;
    vec2 fc = fract(p) - 0.5;
    float dark = 1.0 - f;
    float r = sqrt(dark) * 0.58;
    float d = length(fc);
    float edge = fwidth(d) + 0.01;
    float mask = smoothstep(r + edge, r - edge, d);
    o_frag = vec4(mix(u_baseColor, u_waveColor, mask), 1.0);
    return;
  }

  // ----- ascii -----
  // True square cells: derive cell size from a fixed pixel dimension so
  // glyphs are never stretched on portrait viewports.
  float cellPx = u_pixelSize * 8.0;
  vec2  cellSizeUV = vec2(cellPx) / u_res;
  vec2  gCell    = floor(v_uv / cellSizeUV);
  vec2  gCenter  = (gCell + 0.5) * cellSizeUV;
  float fg = sampleWave(gCenter);

  float idx   = floor(fg * (u_charCount - 1.0) + 0.5);
  vec2  local = fract(v_uv / cellSizeUV);
  local.y = 1.0 - local.y;
  vec2  atlasUV = vec2((idx + local.x) / u_charCount, local.y);
  float glyph = texture(u_atlas, atlasUV).r;
  o_frag = vec4(mix(u_baseColor, u_waveColor, glyph), 1.0);
}
`;

const MODE_INDEX: Record<DitherMode, number> = { bayer: 0, floyd: 1, dots: 2, ascii: 3 };

export interface DitheredWavesOptions {
  mode?: DitherMode;
  matrixSize?: 2 | 4 | 8;
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveColor?: string;
  baseColor?: string;
  colorNum?: number;
  pixelSize?: number;
  charset?: string;
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  pixelRatio?: number;
}

export interface DitheredWavesHandle {
  destroy: () => void;
  setOptions: (next: Partial<DitheredWavesOptions>) => void;
}

const DEFAULTS: Required<Omit<DitheredWavesOptions, 'pixelRatio'>> & { pixelRatio: number } = {
  mode: 'bayer',
  matrixSize: 8,
  waveSpeed: 0.05,
  waveFrequency: 3,
  waveAmplitude: 0.3,
  waveColor: '#7e7e7e',
  baseColor: '#000000',
  colorNum: 4,
  pixelSize: 2,
  charset: ' .:-=+*#%@',
  disableAnimation: false,
  enableMouseInteraction: true,
  mouseRadius: 1,
  pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
};

export function createDitheredWaves(target: HTMLCanvasElement, opts: DitheredWavesOptions = {}): DitheredWavesHandle {
  let options = { ...DEFAULTS, ...opts };
  const gl = target.getContext('webgl2', { antialias: false, premultipliedAlpha: false });
  if (!gl) throw new Error('WebGL2 not supported');

  const prog = program(gl, VERT, WAVE_FRAG);
  const vao = quadVAO(gl);
  const atlasTex = createTex(gl, { filter: gl.LINEAR });
  let charCount = options.charset.length;

  function uploadAtlas(charset: string) {
    const cvs = buildAtlas(charset);
    charCount = charset.length;
    gl!.bindTexture(gl!.TEXTURE_2D, atlasTex);
    gl!.pixelStorei(gl!.UNPACK_ALIGNMENT, 1);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, cvs);
  }
  uploadAtlas(options.charset);

  const loc = {
    res: gl.getUniformLocation(prog, 'u_res'),
    time: gl.getUniformLocation(prog, 'u_time'),
    waveSpeed: gl.getUniformLocation(prog, 'u_waveSpeed'),
    waveFrequency: gl.getUniformLocation(prog, 'u_waveFrequency'),
    waveAmplitude: gl.getUniformLocation(prog, 'u_waveAmplitude'),
    waveColor: gl.getUniformLocation(prog, 'u_waveColor'),
    baseColor: gl.getUniformLocation(prog, 'u_baseColor'),
    pixelSize: gl.getUniformLocation(prog, 'u_pixelSize'),
    colorNum: gl.getUniformLocation(prog, 'u_colorNum'),
    mouse: gl.getUniformLocation(prog, 'u_mouse'),
    mouseEnabled: gl.getUniformLocation(prog, 'u_mouseEnabled'),
    mouseRadius: gl.getUniformLocation(prog, 'u_mouseRadius'),
    mode: gl.getUniformLocation(prog, 'u_mode'),
    matrixSize: gl.getUniformLocation(prog, 'u_matrixSize'),
    atlas: gl.getUniformLocation(prog, 'u_atlas'),
    charCount: gl.getUniformLocation(prog, 'u_charCount'),
  };

  let mouseX = 0, mouseY = 0;
  const onMove = (e: PointerEvent) => {
    const r = target.getBoundingClientRect();
    const dpr = options.pixelRatio;
    mouseX = (e.clientX - r.left) * dpr;
    mouseY = (e.clientY - r.top) * dpr;
  };
  target.addEventListener('pointermove', onMove);

  let visible = true;
  let io: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) visible = e.isIntersecting;
    });
    io.observe(target);
  }

  function sync() {
    const dpr = options.pixelRatio;
    const parent = target.parentElement;
    let cw = target.clientWidth || parent?.clientWidth || 0;
    let ch = target.clientHeight || parent?.clientHeight || 0;
    if (!cw || !ch) { cw = 640; ch = 360; }
    const w = Math.max(1, Math.floor(cw * dpr));
    const h = Math.max(1, Math.floor(ch * dpr));
    if (target.width !== w) target.width = w;
    if (target.height !== h) target.height = h;
  }

  const start = performance.now();
  let raf = 0;

  function draw() {
    sync();
    gl!.useProgram(prog);
    gl!.bindVertexArray(vao);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, atlasTex);
    gl!.uniform1i(loc.atlas, 0);
    gl!.uniform1f(loc.charCount, charCount);
    gl!.uniform2f(loc.res, target.width, target.height);
    gl!.uniform1f(loc.time, options.disableAnimation ? 0 : (performance.now() - start) / 1000);
    gl!.uniform1f(loc.waveSpeed, options.waveSpeed);
    gl!.uniform1f(loc.waveFrequency, options.waveFrequency);
    gl!.uniform1f(loc.waveAmplitude, options.waveAmplitude);
    const wc = parseColor(options.waveColor);
    const bc = parseColor(options.baseColor);
    gl!.uniform3f(loc.waveColor, wc[0], wc[1], wc[2]);
    gl!.uniform3f(loc.baseColor, bc[0], bc[1], bc[2]);
    gl!.uniform1f(loc.pixelSize, Math.max(1, options.pixelSize));
    gl!.uniform1f(loc.colorNum, Math.max(2, Math.min(8, options.colorNum)));
    gl!.uniform2f(loc.mouse, mouseX, mouseY);
    gl!.uniform1f(loc.mouseEnabled, options.enableMouseInteraction ? 1 : 0);
    gl!.uniform1f(loc.mouseRadius, options.mouseRadius);
    gl!.uniform1i(loc.mode, MODE_INDEX[options.mode] ?? 0);
    gl!.uniform1f(loc.matrixSize, options.matrixSize);
    gl!.viewport(0, 0, target.width, target.height);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    draw();
  }
  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      target.removeEventListener('pointermove', onMove);
      io?.disconnect();
      gl.deleteTexture(atlasTex);
      gl.deleteProgram(prog);
    },
    setOptions(next) {
      const prevCharset = options.charset;
      options = { ...options, ...next };
      if (next.charset && next.charset !== prevCharset) uploadAtlas(options.charset);
    },
  };
}
