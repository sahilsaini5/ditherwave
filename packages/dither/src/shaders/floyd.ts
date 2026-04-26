import { COMMON } from './common';
import { BAYER8 } from './bayerConst';

// True Floyd-Steinberg is sequential. This is a Riemersma-style approximation:
// blue-noise threshold + Bayer stabilisation gives an FS-like grain pattern
// without the serial dependency. Document the tradeoff; ship the honest name.

export const FLOYD = COMMON + BAYER8 + /* glsl */ `
float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main(){
  vec3 src = texture(u_src, pixelUV(v_uv)).rgb;
  src = adjustExposure(src);
  vec2 cell = floor(v_uv * u_res);

  float n = hash(cell + u_time * 13.0) - 0.5;
  float b = bayer8(cell) * 0.4;
  float threshold = (n * 0.6 + b) * u_intensity;

  float l = luma(src);
  float dithered = clamp(l + threshold, 0.0, 1.0);

  float levels = max(u_paletteCount - 1.0, 1.0);
  float quantised = floor(dithered * levels + 0.5) / levels;

  o_frag = vec4(paletteLookup(quantised), 1.0);
}`;
