'use client';
import { useState } from 'react';
import { Dither, DitheredWaves, type DitherMode } from 'ditherwave';
import { PALETTES } from '../lib/palettes';
import Snippet from '../components/Snippet';
import Install from '../components/Install';
import DropZone from '../components/DropZone';
import Gallery, { type Preset } from '../components/Gallery';

const MODES: DitherMode[] = ['bayer', 'floyd', 'dots', 'ascii'];

const WAVE_THEMES: Record<string, { wave: string; base: string }> = {
  phosphor:  { wave: '#39ff14', base: '#050605' },
  amber:     { wave: '#ffb000', base: '#110900' },
  matrix:    { wave: '#00ff41', base: '#000000' },
  cyan:      { wave: '#00ffd0', base: '#000614' },
  solar:     { wave: '#b58900', base: '#002b36' },
  blood:     { wave: '#ff003c', base: '#0a0000' },
};

export default function Page() {
  const [mode, setMode] = useState<DitherMode>('bayer');
  const [paletteId, setPaletteId] = useState<string>('phosphor');
  const [resolution, setResolution] = useState(256);
  const [animate, setAnimate] = useState(true);
  const [matrixSize, setMatrixSize] = useState<2 | 4 | 8>(8);
  const [pixelSize, setPixelSize] = useState(3);
  const [colorNum, setColorNum] = useState(4);

  const palette = PALETTES.find((p) => p.id === paletteId) ?? PALETTES[0]!;
  const theme = WAVE_THEMES[paletteId] ?? WAVE_THEMES.phosphor!;

  const applyPreset = (p: Preset) => {
    setMode(p.mode);
    setPaletteId(p.paletteId);
    setResolution(p.resolution);
    if (p.matrixSize) setMatrixSize(p.matrixSize);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="noise crt">
      <section className="hero">
        <header className="topbar">
          <div className="brand">ditherwave</div>
          <nav>
            <a href="#install">install</a>
            <a href="#try">try</a>
            <a href="#gallery">gallery</a>
            <a href="https://github.com/ditherwave/ditherwave" target="_blank" rel="noreferrer">github</a>
          </nav>
        </header>

        <div className="hero-bg">
          <DitheredWaves
            mode={mode}
            matrixSize={matrixSize}
            waveColor={theme.wave}
            baseColor={theme.base}
            waveSpeed={0.04}
            waveFrequency={3.2}
            waveAmplitude={0.34}
            pixelSize={pixelSize}
            colorNum={colorNum}
            disableAnimation={!animate}
            enableMouseInteraction
            mouseRadius={0.25}
          />
        </div>

        <div className="hero-heading reveal">
          <div className="prompt">npm install ditherwave</div>
          <h1><em>dither</em><span style={{ color: 'var(--fg-dim)', marginLeft: '0.12em' }}>wave</span><span className="cursor" /></h1>
          <p>
            a tiny <span className="hl">WebGL2</span> dithering primitive for React.<br />
            wrap <span className="hl">&lt;img&gt;</span>, <span className="hl">&lt;video&gt;</span>, or <span className="hl">&lt;canvas&gt;</span> — or drop in <span className="hl">&lt;DitheredWaves&gt;</span>. <br />
            <span style={{ color: 'var(--accent)' }}>under 8kb gz.</span> zero deps. MIT.
          </p>
        </div>

        <aside className="controls">
          <h3>Effect</h3>
          <div className="modebar">
            {MODES.map((m) => (
              <button key={m} className={mode === m ? 'active' : ''} onClick={() => setMode(m)}>{m}</button>
            ))}
          </div>

          <div className="row" style={{ marginTop: 22 }}>
            <label>Palette</label>
            <div className="palettes">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  className={`palette-swatch ${paletteId === p.id ? 'active' : ''}`}
                  title={p.name}
                  onClick={() => setPaletteId(p.id)}
                >
                  {p.colors.map((c) => <span key={c} style={{ background: c }} />)}
                </button>
              ))}
            </div>
          </div>

          <div className="row">
            <label>
              Pixel size <span style={{ color: 'var(--fg)', float: 'right' }}>{pixelSize}px</span>
            </label>
            <input type="range" className="slider" min={1} max={10} step={1}
              value={pixelSize} onChange={(e) => setPixelSize(Number(e.target.value))} />
          </div>

          <div className="row">
            <label>
              Colour levels <span style={{ color: 'var(--fg)', float: 'right' }}>{colorNum}</span>
            </label>
            <input type="range" className="slider" min={2} max={8} step={1}
              value={colorNum} onChange={(e) => setColorNum(Number(e.target.value))} />
          </div>

          <div className="row">
            <label>
              Wrapper resolution <span style={{ color: 'var(--fg)', float: 'right' }}>{resolution}</span>
            </label>
            <input type="range" className="slider" min={64} max={512} step={8}
              value={resolution} onChange={(e) => setResolution(Number(e.target.value))} />
          </div>

          {/* Always render so the panel keeps a constant height across modes —
              switching mode must not shift the centred hero layout. */}
          <div
            className="row"
            aria-disabled={!(mode === 'bayer' || mode === 'floyd')}
            style={{
              opacity: mode === 'bayer' || mode === 'floyd' ? 1 : 0.35,
              pointerEvents: mode === 'bayer' || mode === 'floyd' ? 'auto' : 'none',
              transition: 'opacity 180ms',
            }}
          >
            <label>Bayer matrix</label>
            <div className="modebar">
              {[2, 4, 8].map((n) => (
                <button key={n} className={matrixSize === n ? 'active' : ''} onClick={() => setMatrixSize(n as 2 | 4 | 8)}>
                  {n}×{n}
                </button>
              ))}
            </div>
          </div>

          <div className="row">
            <button className={`toggle ${animate ? 'on' : ''}`} onClick={() => setAnimate(!animate)}>
              <span className="toggle-dot" />
              <span>Animate</span>
            </button>
          </div>
        </aside>
      </section>

      {/* ---------- snippet ---------- */}
      <section className="pad" id="snippet" data-anchor="snippet">
        <div className="container">
          <h2><em>copy.</em> paste. ship.</h2>
          <p className="lede">
            the controls above update this snippet in real time. when the look is right, grab it.
          </p>
          <Snippet
            mode={mode}
            resolution={resolution}
            palette={palette.colors}
            animate={animate}
            matrixSize={matrixSize}
            paletteName={palette.name}
            waveColor={theme.wave}
            baseColor={theme.base}
            pixelSize={pixelSize}
            colorNum={colorNum}
          />
        </div>
      </section>

      {/* ---------- install ---------- */}
      <section className="pad" id="install" data-anchor="install">
        <div className="container">
          <div className="install">
            <div>
              <h2>one <em>install</em>,<br />done.</h2>
              <p className="lede">
                react 18+ peer dep. esm, cjs, and a umd build for CDNs. tree-shakeable.
                works identically in next.js, vite, and plain html.
              </p>
            </div>
            <Install />
          </div>
        </div>
      </section>

      {/* ---------- try ---------- */}
      <section className="pad" id="try" data-anchor="try">
        <div className="container">
          <h2>dither <em>your</em> image.</h2>
          <p className="lede">
            the background uses <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>&lt;DitheredWaves&gt;</code>.
            this dropzone uses <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>&lt;Dither&gt;</code> over real content.
          </p>
          <DropZone
            mode={mode} palette={palette.colors} resolution={resolution}
            animate={animate} matrixSize={matrixSize}
          />
        </div>
      </section>

      {/* ---------- gallery ---------- */}
      <section className="pad" id="gallery" data-anchor="gallery">
        <div className="container">
          <h2>six <em>recipes</em>.</h2>
          <p className="lede">
            click any card to apply its configuration to the hero above.
          </p>
          <Gallery onApply={applyPreset} />
        </div>
      </section>

      <footer>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 16 }}>
          <div>ditherwave — MIT licensed</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <a href="https://github.com/ditherwave/ditherwave">github</a>
            <a href="https://www.npmjs.com/package/ditherwave">npm</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
