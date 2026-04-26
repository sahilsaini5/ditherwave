export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

// Palettes are colour lists for the <Dither> wrapper. The hero wave maps each
// palette id to a wave/base colour pair in WAVE_THEMES (see page.tsx).
export const PALETTES: Palette[] = [
  { id: 'phosphor',  name: 'Phosphor',   colors: ['#050605', '#39ff14'] },
  { id: 'amber',     name: 'Amber CRT',  colors: ['#110900', '#ffb000'] },
  { id: 'matrix',    name: 'Matrix',     colors: ['#000000', '#003b00', '#008f11', '#00ff41'] },
  { id: 'cyan',      name: 'IBM 3279',   colors: ['#000614', '#00ffd0'] },
  { id: 'solar',     name: 'Solarized',  colors: ['#002b36', '#586e75', '#b58900', '#eee8d5'] },
  { id: 'blood',     name: 'Red Team',   colors: ['#0a0000', '#ff003c'] },
];
