import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createDitheredWaves, type DitheredWavesOptions, type DitheredWavesHandle } from './waves';

export interface DitheredWavesProps extends DitheredWavesOptions {
  className?: string;
  style?: CSSProperties;
  /**
   * Render this when WebGL2 isn't available. Defaults to a solid fill of
   * `baseColor` so the layout doesn't collapse.
   */
  fallback?: ReactNode;
}

const wrap: CSSProperties = { position: 'relative', width: '100%', height: '100%', overflow: 'hidden' };
const cvs: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' };

export function DitheredWaves({ className, style, fallback, ...opts }: DitheredWavesProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const handleRef = useRef<DitheredWavesHandle | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    try {
      handleRef.current = createDitheredWaves(ref.current, opts);
    } catch (err) {
      setUnsupported(true);
      if (typeof console !== 'undefined') console.error('[dither/waves]', err);
    }
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleRef.current?.setOptions(opts);
  }, [
    opts.mode, opts.matrixSize, opts.charset,
    opts.waveSpeed, opts.waveFrequency, opts.waveAmplitude,
    opts.waveColor, opts.baseColor, opts.colorNum, opts.pixelSize,
    opts.disableAnimation, opts.enableMouseInteraction, opts.mouseRadius,
  ]);

  if (unsupported) {
    const fillStyle: CSSProperties = {
      ...wrap,
      ...style,
      background: opts.baseColor ?? '#000000',
    };
    return (
      <div className={className} style={fillStyle}>
        {fallback}
      </div>
    );
  }

  return (
    <div className={className} style={{ ...wrap, ...style }}>
      <canvas ref={ref} style={cvs} />
    </div>
  );
}
