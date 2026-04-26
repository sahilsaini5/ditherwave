import { VERT } from './shaders/vertex';
import { BAYER } from './shaders/bayer';
import { FLOYD } from './shaders/floyd';
import { DOTS } from './shaders/dots';
import { ASCII } from './shaders/ascii';
import { program, quadVAO, createTex, parseColor } from './gl';
import { buildAtlas } from './atlas';
import type { DitherMode, DitherOptions, DitherHandle } from './types';

const DEFAULTS: Required<Omit<DitherOptions, 'charset'>> & { charset: string } = {
  mode: 'bayer',
  resolution: 256,
  palette: ['#0f0f10', '#f5f3ef'],
  intensity: 1,
  animate: false,
  matrixSize: 8,
  charset: ' .:-=+*#%@',
  contrast: 1,
  brightness: 1,
  pauseOffscreen: true,
  pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
};

type Source = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

function isImg(el: Element): el is HTMLImageElement {
  return (el as HTMLElement).tagName === 'IMG';
}
function isVideo(el: Element): el is HTMLVideoElement {
  return (el as HTMLElement).tagName === 'VIDEO';
}
function isCanvas(el: Element): el is HTMLCanvasElement {
  return (el as HTMLElement).tagName === 'CANVAS';
}

export function createDither(target: HTMLCanvasElement, source: Source, opts: DitherOptions = {}): DitherHandle {
  let options = { ...DEFAULTS, ...opts };

  const gl = target.getContext('webgl2', { antialias: false, premultipliedAlpha: false });
  if (!gl) throw new Error('WebGL2 not supported');

  const progs: Record<DitherMode, WebGLProgram> = {
    bayer: program(gl, VERT, BAYER),
    floyd: program(gl, VERT, FLOYD),
    dots: program(gl, VERT, DOTS),
    ascii: program(gl, VERT, ASCII),
  };

  const vao = quadVAO(gl);
  const srcTex = createTex(gl, { filter: gl.LINEAR });
  const palTex = createTex(gl, { filter: gl.NEAREST });
  const atlasTex = createTex(gl, { filter: gl.LINEAR });

  // Initialise srcTex with a 1×1 transparent pixel so the first few RAFs
  // before a video frame / image load have valid (rather than undefined)
  // texture state. Avoids garbage flashing when wrapping <video> sources.
  gl.bindTexture(gl.TEXTURE_2D, srcTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));

  let atlasCanvas: HTMLCanvasElement | null = null;
  let charCount = options.charset.length;

  function uploadPalette(colors: string[]): number {
    const n = Math.max(2, Math.min(8, colors.length));
    const buf = new Uint8Array(n * 4);
    for (let i = 0; i < n; i++) {
      const [r, g, b] = parseColor(colors[i] || '#000');
      buf[i * 4 + 0] = Math.round(r * 255);
      buf[i * 4 + 1] = Math.round(g * 255);
      buf[i * 4 + 2] = Math.round(b * 255);
      buf[i * 4 + 3] = 255;
    }
    gl!.bindTexture(gl!.TEXTURE_2D, palTex);
    gl!.pixelStorei(gl!.UNPACK_ALIGNMENT, 1);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, n, 1, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, buf);
    return n;
  }

  function uploadAtlas(charset: string) {
    atlasCanvas = buildAtlas(charset);
    charCount = charset.length;
    gl!.bindTexture(gl!.TEXTURE_2D, atlasTex);
    gl!.pixelStorei(gl!.UNPACK_ALIGNMENT, 1);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, atlasCanvas);
  }

  let paletteCount = uploadPalette(options.palette);
  uploadAtlas(options.charset);

  // Size target to source aspect once we know it.
  function size(): { w: number; h: number } {
    let sw = 0, sh = 0;
    if (isImg(source)) { sw = source.naturalWidth; sh = source.naturalHeight; }
    else if (isVideo(source)) { sw = source.videoWidth; sh = source.videoHeight; }
    else { sw = source.width; sh = source.height; }
    if (!sw || !sh) { sw = 640; sh = 360; }
    return { w: sw, h: sh };
  }

  function syncCanvas() {
    const { w, h } = size();
    const dpr = options.pixelRatio;
    const parent = target.parentElement;
    let cw = target.clientWidth;
    let ch = target.clientHeight;
    if ((!cw || !ch) && parent) {
      cw = parent.clientWidth;
      ch = parent.clientHeight;
    }
    if (!cw || !ch) {
      cw = w; ch = h;
    }
    const pw = Math.max(1, Math.floor(cw * dpr));
    const ph = Math.max(1, Math.floor(ch * dpr));
    if (target.width !== pw) target.width = pw;
    if (target.height !== ph) target.height = ph;
  }

  function uploadSource() {
    gl!.bindTexture(gl!.TEXTURE_2D, srcTex);
    gl!.pixelStorei(gl!.UNPACK_ALIGNMENT, 1);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
    try {
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, source as TexImageSource);
    } catch {
      // Source not ready yet (video with no frame, img not loaded).
    }
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
  }

  let imgLoaded = false;
  if (isImg(source)) {
    if (source.complete && source.naturalWidth > 0) { imgLoaded = true; uploadSource(); }
    else source.addEventListener('load', () => { imgLoaded = true; uploadSource(); }, { once: true });
  } else {
    imgLoaded = true;
  }

  let visible = true;
  let io: IntersectionObserver | null = null;
  if (options.pauseOffscreen && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) visible = e.isIntersecting;
    }, { threshold: 0 });
    io.observe(target);
  }

  const start = performance.now();
  let raf = 0;
  let vfc = 0;

  function draw() {
    if (!gl) return;
    syncCanvas();

    if (isVideo(source) && source.readyState >= 2) uploadSource();
    else if (isCanvas(source)) uploadSource();

    const mode = options.mode;
    const prog = progs[mode];
    gl.useProgram(prog);
    gl.bindVertexArray(vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, srcTex);
    const uSrc = gl.getUniformLocation(prog, 'u_src');
    if (uSrc) gl.uniform1i(uSrc, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, palTex);
    const uPal = gl.getUniformLocation(prog, 'u_pal');
    if (uPal) gl.uniform1i(uPal, 1);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    if (uRes) gl.uniform2f(uRes, options.resolution, options.resolution);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    if (uTime) gl.uniform1f(uTime, options.animate ? (performance.now() - start) / 1000 : 0);

    const uInt = gl.getUniformLocation(prog, 'u_intensity');
    if (uInt) gl.uniform1f(uInt, options.intensity);

    const uContrast = gl.getUniformLocation(prog, 'u_contrast');
    if (uContrast) gl.uniform1f(uContrast, options.contrast);
    const uBrightness = gl.getUniformLocation(prog, 'u_brightness');
    if (uBrightness) gl.uniform1f(uBrightness, options.brightness);

    const uPc = gl.getUniformLocation(prog, 'u_paletteCount');
    if (uPc) gl.uniform1f(uPc, paletteCount);

    if (mode === 'bayer') {
      const uMs = gl.getUniformLocation(prog, 'u_matrixSize');
      if (uMs) gl.uniform1f(uMs, options.matrixSize);
    }

    if (mode === 'ascii') {
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      const uAtlas = gl.getUniformLocation(prog, 'u_atlas');
      if (uAtlas) gl.uniform1i(uAtlas, 2);
      const uCharCount = gl.getUniformLocation(prog, 'u_charCount');
      if (uCharCount) gl.uniform1f(uCharCount, charCount);
      const uCell = gl.getUniformLocation(prog, 'u_cell');
      if (uCell) {
        const aspect = target.width / target.height;
        const cellX = Math.max(4, Math.floor(options.resolution / 4));
        const cellY = Math.max(4, Math.floor(cellX / aspect));
        gl.uniform2f(uCell, cellX, cellY);
      }
    }

    gl.viewport(0, 0, target.width, target.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    if (!imgLoaded) return;
    draw();
  }

  raf = requestAnimationFrame(tick);

  // Use requestVideoFrameCallback if available for tear-free video sampling.
  function vidTick() {
    if (isVideo(source) && 'requestVideoFrameCallback' in source) {
      vfc = (source as HTMLVideoElement).requestVideoFrameCallback(() => {
        uploadSource();
        vidTick();
      });
    }
  }
  vidTick();

  const onLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
  };
  // On context restore the engine doesn't auto-rebuild — the host has to
  // re-instantiate via createDither. Listener is registered so the default
  // browser handler doesn't run, but we don't log; consumers who care can
  // listen on the canvas themselves.
  const onRestored = () => {};
  target.addEventListener('webglcontextlost', onLost);
  target.addEventListener('webglcontextrestored', onRestored);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      if (io) io.disconnect();
      target.removeEventListener('webglcontextlost', onLost);
      target.removeEventListener('webglcontextrestored', onRestored);
      if (isVideo(source) && 'cancelVideoFrameCallback' in source && vfc) {
        (source as HTMLVideoElement).cancelVideoFrameCallback(vfc);
      }
      gl.deleteTexture(srcTex);
      gl.deleteTexture(palTex);
      gl.deleteTexture(atlasTex);
      (Object.values(progs) as WebGLProgram[]).forEach((p) => gl.deleteProgram(p));
    },
    setOptions(next: Partial<DitherOptions>) {
      const prevPalette = options.palette;
      const prevCharset = options.charset;
      options = { ...options, ...next };
      if (next.palette && next.palette !== prevPalette) paletteCount = uploadPalette(options.palette);
      if (next.charset && next.charset !== prevCharset) uploadAtlas(options.charset);
    },
    render() { draw(); },
  };
}
