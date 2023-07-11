import { defineConfig } from 'tsup';

export default defineConfig(async () => {
  return {
    entry: [
      'src/index.ts'
    ],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: true,
    clean: true,
    shims: true
  };
});
