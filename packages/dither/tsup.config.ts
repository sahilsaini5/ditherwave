import { defineConfig } from 'tsup';

export default defineConfig([
  // Main entry — React + vanilla together. React is external (peer dep).
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    target: 'es2020',
    external: ['react'],
    minify: true,
  },
  {
    entry: { 'index.umd': 'src/index.ts' },
    format: ['iife'],
    globalName: 'Dither',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    sourcemap: true,
    dts: false,
    clean: false,
    external: ['react'],
    footer: { js: 'globalThis.Dither = Dither;' },
  },
  // Vanilla entry — no React imports, safe for plain HTML / CDN use.
  {
    entry: { vanilla: 'src/vanilla.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    treeshake: true,
    target: 'es2020',
    minify: true,
  },
  {
    entry: { 'vanilla.umd': 'src/vanilla.ts' },
    format: ['iife'],
    globalName: 'Dither',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    sourcemap: true,
    dts: false,
    clean: false,
    footer: { js: 'globalThis.Dither = Dither;' },
  },
]);
