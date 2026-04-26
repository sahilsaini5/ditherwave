export const COMMON = /* glsl */ `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 o_frag;
uniform sampler2D u_src;
uniform sampler2D u_pal;
uniform vec2 u_res;         // logical dither grid (cells across)
uniform float u_time;
uniform float u_intensity;
uniform float u_paletteCount;
uniform float u_contrast;   // 0.5..3, default 1
uniform float u_brightness; // 0.5..2, default 1

float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

// Snap v_uv to the dither grid before sampling so the source is quantised to
// the same cells the threshold pattern uses. Without this, a sharp source
// image will still show its full detail underneath the dot pattern.
vec2 pixelUV(vec2 uv){
  return (floor(uv * u_res) + 0.5) / u_res;
}

// Webcam content sits in a narrow mid-tone band, so without contrast
// expansion the dither pattern becomes uniform speckle. Apply the standard
// 8-bit contrast curve and a brightness multiplier before the luminance
// lookup. Both default to 1 (no-op) for image inputs.
vec3 adjustExposure(vec3 c){
  c = (c - 0.5) * u_contrast + 0.5;
  c *= u_brightness;
  return clamp(c, 0.0, 1.0);
}

vec3 paletteLookup(float t){
  t = clamp(t, 0.0, 1.0);
  float n = max(u_paletteCount - 1.0, 1.0);
  float idx = floor(t * n + 0.5);
  vec2 uv = vec2((idx + 0.5) / u_paletteCount, 0.5);
  return texture(u_pal, uv).rgb;
}

// Per-channel palette quantisation: dither each RGB channel independently
// through the Bayer matrix. For multi-colour palettes this preserves hue far
// better than quantising luminance alone.
vec3 ditherRGB(vec3 color, float threshold){
  float step = 1.0 / max(u_paletteCount - 1.0, 1.0);
  color += vec3(threshold) * step;
  color = clamp(color, 0.0, 1.0);
  return floor(color * (u_paletteCount - 1.0) + 0.5) / (u_paletteCount - 1.0);
}
`;
