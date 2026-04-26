# Changelog

## 0.1.0 — initial release

### Components

- **`<Dither>`** — wraps an `<img>`, `<video>`, or `<canvas>` and re-renders it through a WebGL2 dither pass every frame. Live video sampling via `requestVideoFrameCallback` when available. Optional `fallback` prop for browsers without WebGL2.
- **`<DitheredWaves>`** — full-bleed animated fBm-noise background, dithered and palette-quantised. Drop-in hero. Inspired by reactbits' Dither background, reimplemented in raw WebGL2 to skip the three.js dependency.

### Modes

- `bayer` — ordered dithering, configurable 2×2 / 4×4 / 8×8 matrices.
- `floyd` — Riemersma-style Hilbert-walk approximation of Floyd-Steinberg (single-pass GPU-friendly; not true FS).
- `dots` — newspaper halftone, rotated 15° for authentic print feel.
- `ascii` — luminance-indexed glyph atlas, customisable charset.

### Distribution

- ESM, CJS, and UMD outputs, all with sourcemaps.
- Separate `ditherwave/vanilla` entry — zero React imports for plain HTML / CDN consumers.
- React is an **optional** peer dependency (`peerDependenciesMeta.react.optional`).
- Bundle size: ~8 kb gzipped (index), ~7 kb gzipped (vanilla).

### Other

- Imperative API: `createDither`, `createDitheredWaves`, `dither` alias.
- React hook: `useDither`.
- Pauses offscreen via `IntersectionObserver` (opt-out via `pauseOffscreen={false}`).
- Demo site at `apps/demo`.
