// Vanilla / framework-free entry point. No React imports — safe to drop into
// a plain <script> tag or any non-React project.
//
// Use from npm:
//   import { dither, createDitheredWaves } from 'dither/vanilla';
//
// Use from a CDN:
//   <script src="https://unpkg.com/dither/dist/vanilla.umd.global.js"></script>
//   <script>
//     const { createDitheredWaves } = window.Dither;
//     createDitheredWaves(document.querySelector('#bg'), {
//       gradient: ['#a855f7', '#f472b6'], baseColor: '#07070b',
//     });
//   </script>

import { createDither } from './engine';
import { createDitheredWaves } from './waves';
import type { DitherOptions } from './types';

export { createDither, createDitheredWaves };
export type { DitherMode, DitherOptions, DitherHandle } from './types';
export type { DitheredWavesOptions, DitheredWavesHandle } from './waves';

/** Convenience one-shot: dither a source into a target canvas. */
export function dither(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  target: HTMLCanvasElement,
  options?: DitherOptions
) {
  return createDither(target, source, options);
}
