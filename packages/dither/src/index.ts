import { createDither } from './engine';
import type { DitherOptions } from './types';

export { Dither, useDither } from './react';
export type { DitherProps } from './react';
export { createDither };
export type { DitherMode, DitherOptions, DitherHandle } from './types';

export { DitheredWaves } from './wavesReact';
export type { DitheredWavesProps } from './wavesReact';
export { createDitheredWaves } from './waves';
export type { DitheredWavesOptions, DitheredWavesHandle } from './waves';

// Framework-agnostic one-shot helper for non-React users.
export function dither(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  target: HTMLCanvasElement,
  options?: DitherOptions
) {
  return createDither(target, source, options);
}
