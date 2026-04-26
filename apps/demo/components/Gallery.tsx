'use client';
import { DitheredWaves, type DitherMode } from 'ditherwave';

interface Preset {
  label: string;
  mode: DitherMode;
  paletteId: string;
  resolution: number;
  matrixSize?: 2 | 4 | 8;
  wave: string;
  base: string;
  pixelSize: number;
  colorNum: number;
  waveFrequency: number;
  waveAmplitude: number;
  waveSpeed: number;
}

const PRESETS: Preset[] = [
  { label: 'Phosphor',    mode: 'bayer',  paletteId: 'phosphor', resolution: 320, matrixSize: 8,
    wave: '#39ff14', base: '#050605', pixelSize: 3, colorNum: 2,
    waveFrequency: 3.1, waveAmplitude: 0.32, waveSpeed: 0.04 },

  { label: 'Matrix Rain', mode: 'ascii',  paletteId: 'matrix',   resolution: 220,
    wave: '#00ff41', base: '#000000', pixelSize: 2, colorNum: 4,
    waveFrequency: 3.6, waveAmplitude: 0.4, waveSpeed: 0.06 },

  { label: 'Amber CRT',   mode: 'dots',   paletteId: 'amber',    resolution: 260,
    wave: '#ffb000', base: '#110900', pixelSize: 4, colorNum: 3,
    waveFrequency: 3.2, waveAmplitude: 0.36, waveSpeed: 0.045 },

  { label: 'IBM 3279',    mode: 'bayer',  paletteId: 'cyan',     resolution: 280, matrixSize: 4,
    wave: '#00ffd0', base: '#000614', pixelSize: 3, colorNum: 4,
    waveFrequency: 2.9, waveAmplitude: 0.3, waveSpeed: 0.05 },

  { label: 'Red Team',    mode: 'floyd',  paletteId: 'blood',    resolution: 260, matrixSize: 8,
    wave: '#ff003c', base: '#0a0000', pixelSize: 2, colorNum: 3,
    waveFrequency: 2.6, waveAmplitude: 0.44, waveSpeed: 0.055 },

  { label: 'Solarized',   mode: 'dots',   paletteId: 'solar',    resolution: 220,
    wave: '#b58900', base: '#002b36', pixelSize: 3, colorNum: 4,
    waveFrequency: 3.4, waveAmplitude: 0.32, waveSpeed: 0.04 },
];

function PresetCard({ p, onApply }: { p: Preset; onApply: (p: Preset) => void }) {
  return (
    <div className="gallery-card" onClick={() => onApply(p)}>
      <DitheredWaves
        mode={p.mode}
        waveColor={p.wave}
        baseColor={p.base}
        pixelSize={p.pixelSize}
        colorNum={p.colorNum}
        waveFrequency={p.waveFrequency}
        waveAmplitude={p.waveAmplitude}
        waveSpeed={p.waveSpeed}
        enableMouseInteraction={false}
        style={{ width: '100%', height: '100%' }}
      />
      <div className="gallery-card-meta">
        <span>{p.label}</span>
        <span style={{ color: 'var(--accent)' }}>{p.mode} · {p.colorNum}lv</span>
      </div>
    </div>
  );
}

export default function Gallery({ onApply }: { onApply: (p: Preset) => void }) {
  return (
    <div className="gallery">
      {PRESETS.map((p) => <PresetCard key={p.label} p={p} onApply={onApply} />)}
    </div>
  );
}

export type { Preset };
