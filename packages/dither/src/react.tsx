import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { createDither } from './engine';
import type { DitherOptions, DitherHandle } from './types';

export interface DitherProps extends DitherOptions {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Render this when WebGL2 isn't available (e.g. iOS < 15, headless,
   * privacy browsers). Defaults to rendering the original child untouched
   * so the page still has visible content.
   */
  fallback?: ReactNode;
}

const wrapperBase: CSSProperties = {
  position: 'relative',
  display: 'block',
  overflow: 'hidden',
};
const canvasStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  display: 'block',
};
const hiddenStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  visibility: 'hidden',
  pointerEvents: 'none',
};
const fallbackContentStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

export function Dither({ children, className, style, fallback, ...opts }: DitherProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<DitherHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const source = host.querySelector('img, video, canvas') as
      | HTMLImageElement
      | HTMLVideoElement
      | HTMLCanvasElement
      | null;
    if (!source) return;
    try {
      handleRef.current = createDither(canvas, source, opts);
      setReady(true);
    } catch (err) {
      setUnsupported(true);
      if (typeof console !== 'undefined') console.error('[dither]', err);
    }
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
      setReady(false);
    };
    // Intentionally only re-init when structural inputs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleRef.current?.setOptions(opts);
  }, [opts.mode, opts.resolution, opts.intensity, opts.animate, opts.matrixSize, opts.charset, opts.contrast, opts.brightness, opts.palette?.join(',')]);

  return (
    <div ref={hostRef} className={className} style={{ ...wrapperBase, ...style }}>
      <div style={unsupported ? fallbackContentStyle : hiddenStyle} aria-hidden={!unsupported}>
        {unsupported && fallback ? fallback : children}
      </div>
      {!unsupported && (
        <canvas ref={canvasRef} style={{ ...canvasStyle, opacity: ready ? 1 : 0, transition: 'opacity 180ms ease' }} />
      )}
    </div>
  );
}

export function useDither(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  sourceRef: React.RefObject<HTMLImageElement | HTMLVideoElement | HTMLCanvasElement>,
  options: DitherOptions = {}
) {
  const handleRef = useRef<DitherHandle | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    try {
      handleRef.current = createDither(canvas, source, options);
    } catch (err) {
      if (typeof console !== 'undefined') console.error('[dither]', err);
    }
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    handleRef.current?.setOptions(options);
  }, [options.mode, options.resolution, options.intensity, options.animate, options.matrixSize, options.charset, options.palette?.join(',')]);
  return handleRef;
}
