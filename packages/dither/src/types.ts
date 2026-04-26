export type DitherMode = 'bayer' | 'floyd' | 'dots' | 'ascii';

export interface DitherOptions {
  mode?: DitherMode;
  resolution?: number;
  palette?: string[];
  intensity?: number;
  animate?: boolean;
  matrixSize?: 2 | 4 | 8;
  charset?: string;
  /**
   * Contrast multiplier applied to the source before luminance lookup.
   * Defaults to 1 (no change). Push to ~1.5 for webcam input so the dither
   * pattern actually expresses content instead of uniform mid-tone speckle.
   */
  contrast?: number;
  /** Brightness multiplier applied after contrast. Defaults to 1. */
  brightness?: number;
  pauseOffscreen?: boolean;
  pixelRatio?: number;
}

export interface DitherHandle {
  destroy: () => void;
  setOptions: (options: Partial<DitherOptions>) => void;
  render: () => void;
}
