import { builtinModules } from 'node:module';
// following three plugins are only necessary for some node dependencies
import PluginCommonJs from '@rollup/plugin-commonjs';
import PluginJson from '@rollup/plugin-json';
import PluginNodeResolve from '@rollup/plugin-node-resolve';
import Typescript from '@rollup/plugin-typescript';
import LicensePlugin from 'rollup-plugin-oss';

export default {
  input: './index.ts',
  external: [...builtinModules.flatMap(p => [p, `node:${p}`])],
  output: {
    dir: './dist',
    exports: 'named',
    format: 'cjs'
  },
  plugins: [
    PluginJson(),
    PluginCommonJs(),
    PluginNodeResolve({
      preferBuiltins: true
    }),
    Typescript({
      module: 'ESNext',
      target: 'ES6'
    }),
    LicensePlugin()
  ]
};
