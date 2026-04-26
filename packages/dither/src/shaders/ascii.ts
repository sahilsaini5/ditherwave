import { COMMON } from './common';

// Luminance-indexed glyph lookup. Each screen cell samples one source pixel,
// picks a glyph from the atlas based on brightness, and draws it on top of
// the paper colour.

export const ASCII = COMMON + /* glsl */ `
uniform sampler2D u_atlas;
uniform float u_charCount;
uniform vec2 u_cell;

void main(){
  // Quantise UV to cell grid for both source sampling and glyph lookup.
  vec2 cell = floor(v_uv * u_cell);
  vec2 cellCenter = (cell + 0.5) / u_cell;
  vec3 src = texture(u_src, cellCenter).rgb;
  src = adjustExposure(src);
  float l = luma(src);

  float idx = floor(l * (u_charCount - 1.0) + 0.5);

  vec2 local = fract(v_uv * u_cell);
  // Flip Y to match canvas2D atlas orientation.
  local.y = 1.0 - local.y;
  vec2 atlasUV = vec2((idx + local.x) / u_charCount, local.y);
  float glyph = texture(u_atlas, atlasUV).r;

  vec3 ink = paletteLookup(0.0);
  vec3 paper = paletteLookup(1.0);

  o_frag = vec4(mix(paper, ink, glyph), 1.0);
}`;
