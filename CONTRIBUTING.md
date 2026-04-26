# contributing

Open an issue or a PR. Keep the library core under 10kb gzipped — features that push it past that will be declined or moved to the demo package.

```sh
pnpm install
pnpm --filter ditherwave build        # build library
pnpm --filter dither-demo dev     # run demo at :3100
pnpm --filter ditherwave size         # check gzipped size
```

Shaders live in `packages/dither/src/shaders/`. The engine (`src/engine.ts`) owns texture lifecycle, render loop, and `IntersectionObserver`. The React surface is thin on purpose.
