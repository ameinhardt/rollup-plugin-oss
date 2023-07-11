import { builtinModules } from 'node:module';
// following three plugins are only necessary for some node dependencies
import PluginCommonJs from '@rollup/plugin-commonjs';
import PluginJson from '@rollup/plugin-json';
import PluginNodeResolve from '@rollup/plugin-node-resolve';
import Typescript from '@rollup/plugin-typescript';
import LicensePlugin from 'rollup-plugin-oss';

export default {
  input: './src/index.ts',
  external: [...builtinModules.flatMap(p => [p, `node:${p}`])],
  output: {
    dir: './example',
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
      declaration: false
    }),
    LicensePlugin({
      extra: [{
        license: 'CC0-1.0',
        name: 'license-list-xml',
        repository: 'https://github.com/spdx/license-list-XML',
        version: '2.6.0',
        author: 'Linux Foundation and its Contributors',
        description: 'The SPDX License List is a list of commonly found licenses and exceptions used for open source and other collaborative software.  The XML format is an internal representation of the licenses.  See the license-list-data for supported formats for the license list.'
      }]
    })
  ]
};
