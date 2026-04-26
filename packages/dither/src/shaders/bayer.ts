import { COMMON } from './common';
import { BAYER8 } from './bayerConst';

export const BAYER = COMMON + BAYER8 + /* glsl */ `
uniform float u_matrixSize;

void main(){
  vec3 src = texture(u_src, pixelUV(v_uv)).rgb;
  src = adjustExposure(src);
  vec2 cell = floor(v_uv * u_res + u_time * 4.0);

  float threshold = bayerN(cell, u_matrixSize);

  float l = luma(src);
  float dithered = clamp(l + threshold * u_intensity, 0.0, 1.0);

  float levels = max(u_paletteCount - 1.0, 1.0);
  float quantised = floor(dithered * levels + 0.5) / levels;

  o_frag = vec4(paletteLookup(quantised), 1.0);
}`;
