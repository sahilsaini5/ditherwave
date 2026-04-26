// Build an ASCII glyph atlas: N characters rendered side-by-side into a single
// canvas, then turned into a luminance texture. We use the system monospace
// stack to keep bundle size down — for a specific font, pass your own atlas
// canvas into the vanilla API.

export function buildAtlas(chars: string, cellSize = 16): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = cellSize * chars.length;
  c.height = cellSize;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = `${Math.floor(cellSize * 0.9)}px ui-monospace, "JetBrains Mono", "Fira Code", "Menlo", monospace`;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i]!, i * cellSize + cellSize / 2, cellSize / 2 + 1);
  }
  return c;
}
