import { defineConfig } from 'tsup';

export default defineConfig(async () => {
  return {
    clean: true,
    dts: {
      compilerOptions: {
        ignoreDeprecations: '6.0'
      }
    },
    entry: [
      'src/index.ts'
    ],
    format: ['cjs', 'esm'],
    platform: 'node',
    shims: true,
    splitting: true,
    target: 'node18'
  };
});
