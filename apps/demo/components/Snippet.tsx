'use client';
import { useState } from 'react';
import type { DitherMode } from 'ditherwave';

interface Props {
  mode: DitherMode;
  resolution: number;
  palette: string[];
  animate: boolean;
  matrixSize: number;
  paletteName: string;
  waveColor: string;
  baseColor: string;
  pixelSize: number;
  colorNum: number;
}

export default function Snippet({
  mode, resolution, palette, animate, matrixSize, paletteName,
  waveColor, baseColor, pixelSize, colorNum,
}: Props) {
  const [tab, setTab] = useState<'waves' | 'dither'>('waves');
  const [copied, setCopied] = useState(false);

  const wavesCode = `import { DitheredWaves } from 'ditherwave';

<DitheredWaves
  waveColor="${waveColor}"
  baseColor="${baseColor}"
  pixelSize={${pixelSize}}
  colorNum={${colorNum}}
  waveSpeed={0.04}
  waveFrequency={3.2}
  waveAmplitude={0.34}
  enableMouseInteraction
/>`;

  const paletteStr = `[${palette.map((c) => `"${c}"`).join(', ')}]`;
  const ditherCode = `import { Dither } from 'ditherwave';

<Dither
  mode="${mode}"
  resolution={${resolution}}
  palette={${paletteStr}}${mode === 'bayer' ? `
  matrixSize={${matrixSize}}` : ''}
  animate={${animate}}
>
  <img src="https://picsum.photos/800" alt="" />
</Dither>`;

  const code = tab === 'waves' ? wavesCode : ditherCode;

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const esc = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const highlighted = esc(code)
    .replace(/\b(import|from)\b/g, '<span class="token-key">$1</span>')
    .replace(/(&lt;\/?[A-Z][A-Za-z]*|\/&gt;|&gt;)/g, '<span class="token-tag">$1</span>')
    .replace(/"([^"]+)"/g, '<span class="token-str">"$1"</span>')
    .replace(/(\{|\})/g, '<span class="token-punct">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="token-num">$1</span>');

  return (
    <div>
      <div className="pm-tabs" style={{ marginBottom: 12 }}>
        <button className={tab === 'waves' ? 'active' : ''} onClick={() => setTab('waves')}>&lt;DitheredWaves&gt;</button>
        <button className={tab === 'dither' ? 'active' : ''} onClick={() => setTab('dither')}>&lt;Dither&gt;</button>
      </div>
      <div className="code-block">
        <button className="copy" onClick={copy} aria-label="Copy snippet">
          {copied ? 'copied' : 'copy'}
        </button>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        <div style={{ marginTop: 14, color: 'var(--fg-dim)', fontSize: 11 }}>
          current — <span style={{ color: 'var(--accent)' }}>{paletteName.toLowerCase()}</span>
          {tab === 'dither' ? ` · ${mode}${mode === 'bayer' ? ` ${matrixSize}×${matrixSize}` : ''}` : ` · ${colorNum} levels · ${pixelSize}px`}
        </div>
      </div>
    </div>
  );
}
