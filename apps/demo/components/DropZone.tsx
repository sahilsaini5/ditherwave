'use client';
import { useState } from 'react';
import { Dither, type DitherMode } from 'ditherwave';

interface Props {
  mode: DitherMode;
  palette: string[];
  resolution: number;
  animate: boolean;
  matrixSize: number;
}

export default function DropZone({ mode, palette, resolution, animate, matrixSize }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [kind, setKind] = useState<'image' | 'video' | null>(null);
  const [drag, setDrag] = useState(false);

  const onFile = (f: File) => {
    const url = URL.createObjectURL(f);
    setSrc(url);
    setKind(f.type.startsWith('video') ? 'video' : 'image');
  };

  return (
    <div>
      <div
        className={`dropzone ${drag ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        {!src && (
          <div>
            <div style={{ fontSize: 22, fontFamily: 'var(--font-serif)', fontStyle: 'italic', marginBottom: 8, color: 'var(--fg)' }}>
              drop an image or video
            </div>
            <div style={{ marginBottom: 20 }}>png · jpg · mp4 · webm</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <label style={{ border: '1px solid var(--line)', padding: '10px 18px', cursor: 'pointer', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
                />
                choose file
              </label>
            </div>
          </div>
        )}

        {src && (
          <div className="dropzone-preview">
            {/* `key` forces a clean re-init of the dither engine whenever the
                source changes (image ↔ video). Without it the engine holds
                a stale ref to the previous source. */}
            <Dither
              key={`${kind}:${src}`}
              mode={mode}
              palette={palette}
              resolution={resolution}
              animate={animate}
              matrixSize={matrixSize as 2 | 4 | 8}
              style={{ width: '100%', height: '100%' }}
            >
              {kind === 'video' && (
                <video src={src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {kind === 'image' && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </Dither>
            <button
              onClick={() => { setSrc(null); setKind(null); }}
              style={{
                position: 'absolute', top: 12, right: 12,
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.15em',
                textTransform: 'uppercase', padding: '8px 14px',
                background: 'rgba(13,12,10,0.8)', border: '1px solid var(--line)', color: 'var(--fg)', zIndex: 10,
              }}
            >
              reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
