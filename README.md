<div align="center">

# ditherwave

**A tiny WebGL2 dithering primitive for React.**
Wrap any image, video, or canvas in `<Dither>` — or drop in `<DitheredWaves>` for an animated grainy background. Bayer, halftone, ASCII, or error-diffusion. Live, animated, **under 8kb gzipped**.

[![npm](https://img.shields.io/npm/v/ditherwave?style=flat-square)](https://www.npmjs.com/package/ditherwave)
[![bundle](https://img.shields.io/bundlephobia/minzip/ditherwave?style=flat-square)](https://bundlephobia.com/package/ditherwave)
[![license](https://img.shields.io/npm/l/ditherwave?style=flat-square)](./LICENSE)

</div>

---

## install

```sh
npm install ditherwave
# or: pnpm add ditherwave · yarn add ditherwave · bun add ditherwave
```

React is an **optional** peer dep — only needed if you import the React components. Zero runtime dependencies otherwise.

### use without React (plain HTML / CSS / JS)

```html
<canvas id="bg" style="width:100%;height:100vh"></canvas>

<script type="module">
  import { createDitheredWaves } from 'https://esm.sh/ditherwave/vanilla';
  createDitheredWaves(document.getElementById('bg'), {
    waveColor: '#39ff14',
    baseColor: '#050605',
  });
</script>
```

Or via npm + a `<script>` tag (no bundler):

```html
<canvas id="bg"></canvas>
<script src="./node_modules/ditherwave/dist/vanilla.umd.global.js"></script>
<script>
  Dither.createDitheredWaves(document.getElementById('bg'), { /* ...opts */ });
</script>
```

The `ditherwave/vanilla` entry contains only the framework-free helpers (`createDither`, `createDitheredWaves`, `dither`) and pulls in zero React code.

## use

Two primitives. Pick one.

### `<Dither>` — dither existing content

```tsx
import { Dither } from 'ditherwave';

<Dither mode="bayer" palette={['#0f380f', '#9bbc0f']} animate>
  <img src="https://picsum.photos/800" alt="" />
</Dither>
```

Drop an `<img>`, `<video>`, or `<canvas>` inside and it'll be dithered into the output canvas every frame. Sources update live — video textures via `requestVideoFrameCallback`, canvases every frame.

### `<DitheredWaves>` — animated noise background

```tsx
import { DitheredWaves } from 'ditherwave';

<DitheredWaves
  waveColor="#9bbc0f"
  baseColor="#0f380f"
  pixelSize={3}
  colorNum={4}
/>
```

A full-bleed animated fBm-noise pattern, bayer-dithered, quantised to `colorNum` levels per channel. Drop-in hero background.

## api

### `<Dither>` props

| Prop             | Type                                              | Default        | Notes |
| ---------------- | ------------------------------------------------- | -------------- | ----- |
| `mode`           | `'bayer' \| 'floyd' \| 'dots' \| 'ascii'`         | `'bayer'`      | |
| `resolution`     | `number`                                          | `256`          | output pixel grid on the short edge |
| `palette`        | `string[]`                                        | `['#0d0c0a','#ece8df']` | 2–8 hex colors |
| `intensity`      | `number`                                          | `1`            | 0–1, strength of the pattern |
| `animate`        | `boolean`                                         | `false`        | slow drift on the threshold pattern |
| `matrixSize`     | `2 \| 4 \| 8`                                     | `8`            | bayer only |
| `charset`        | `string`                                          | `' .:-=+*#%@'` | ascii only, density ramp low→high |
| `pauseOffscreen` | `boolean`                                         | `true`         | uses IntersectionObserver |
| `fallback`       | `ReactNode`                                       | `children`     | rendered when WebGL2 isn't available |

### `<DitheredWaves>` props

| Prop                     | Type      | Default     |
| ------------------------ | --------- | ----------- |
| `mode`                   | `'bayer' \| 'floyd' \| 'dots' \| 'ascii'` | `'bayer'` |
| `waveColor`              | hex       | `'#7e7e7e'` |
| `baseColor`              | hex       | `'#000000'` |
| `waveSpeed`              | `number`  | `0.05`      |
| `waveFrequency`          | `number`  | `3`         |
| `waveAmplitude`          | `number`  | `0.3`       |
| `pixelSize`              | `number`  | `2`         |
| `colorNum`               | `number`  | `4`         |
| `matrixSize`             | `2 \| 4 \| 8` | `8`     |
| `enableMouseInteraction` | `boolean` | `true`      |
| `mouseRadius`            | `number`  | `1`         |
| `disableAnimation`       | `boolean` | `false`     |

Also exported:

- `useDither(canvasRef, sourceRef, options)` — imperative hook.
- `createDither(target, source, options)` — framework-agnostic; returns `{ destroy, setOptions, render }`.
- `createDitheredWaves(target, options)` — same, for the noise background.
- `dither(source, target, options)` — alias for non-React users.

## modes

**bayer** — ordered dithering. Cheap, GPU-friendly, parallelizes perfectly. The Obra Dinn / Gameboy look.

**floyd** — error diffusion. True Floyd-Steinberg is sequential and can't run in a single fragment pass. This mode ships a **Riemersma-style Hilbert-walk approximation** that reads neighbours and mixes a low-discrepancy threshold — it's *not* true FS, and we won't pretend it is. Looks close enough that you'll only notice in A/B.

**dots** — newspaper halftone. Rotated 15° for authentic print feel. Dot radius scales with local darkness. The pretty one.

**ascii** — luminance-indexed glyph atlas built at init. Uses the system monospace stack for ~0 bundle cost; pass your own `charset` for a denser ramp.

## performance

- 60fps on a 2020 MacBook Air at 1080p / resolution 256.
- Zero per-frame allocations after init.
- `devicePixelRatio` capped at 2 — dithering at 3× is wasteful.
- Pauses when scrolled offscreen (IntersectionObserver, on by default).
- Listens for `webglcontextlost`; reinit on `webglcontextrestored` is your call.

## size

Library core ships ESM, CJS, and UMD with sourcemaps. The full public surface tree-shakes down to under 8kb gzipped. Use `pnpm --filter ditherwave size` to check locally.

## credits

`<DitheredWaves>` is heavily inspired by [reactbits' Dither background](https://reactbits.dev/backgrounds/dither) — same domain-warped fBm noise + Bayer post-process, reimplemented in raw WebGL2 to keep the bundle small and avoid the three.js / postprocessing dependency. If you only need the background and you're already using `@react-three/fiber`, use theirs.

## license

MIT.
