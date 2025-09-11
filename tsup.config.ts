import { defineConfig } from 'tsup';

export default defineConfig(async () => {
  return {
    clean: true,
    dts: true,
    entry: [
      'src/index.ts'
    ],
    format: ['cjs', 'esm'],
    shims: true,
    splitting: true
  };
});
