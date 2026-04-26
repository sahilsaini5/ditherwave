import { COMMON } from './common';

// Newspaper halftone. Grid is rotated 15 degrees for authentic print feel;
// dot radius scales with local darkness of the pixelated source.

export const DOTS = COMMON + /* glsl */ `
void main(){
  float ang = radians(15.0);
  float cs = cos(ang), sn = sin(ang);
  mat2 rot = mat2(cs, -sn, sn, cs);

  // Rotate the sampling grid into a tilted coordinate frame; one cell per
  // u_res unit across the screen.
  vec2 p = rot * ((v_uv - 0.5) * u_res);
  vec2 f = fract(p) - 0.5;

  vec3 src = texture(u_src, pixelUV(v_uv)).rgb;
  src = adjustExposure(src);
  float l = luma(src);
  float dark = 1.0 - l;

  // sqrt keeps mid-tones readable; ink coverage goes ~0 .. ~0.58
  float r = sqrt(dark) * 0.58 * mix(0.6, 1.0, u_intensity);
  float d = length(f);

  // Crisp edge, anti-aliased over one cell.
  float edge = fwidth(d) + 0.01;
  float mask = smoothstep(r + edge, r - edge, d);

  vec3 ink = paletteLookup(0.0);
  vec3 paper = paletteLookup(1.0);

  o_frag = vec4(mix(paper, ink, mask), 1.0);
}`;
