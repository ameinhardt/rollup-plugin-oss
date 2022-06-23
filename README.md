# Rollup Plugin OSS

[Rollup](https://rollupjs.org/) is a module bundler for JavaScript. It knows best which sourcecode it bundles.\
This plugin hooks into the bundling step of rollup to
* traces back the corresponding `package.json` of each bundled source file for (version, license and other) information
* collects information of all used packages and adds them in a `disclosure.json` to the bundle
* zips all used source files, package.json and found license files, grouped by package, in `src.zip`

This also works with [vite](https://vitejs.dev/).
The behavior is similiar to [license-checker-webpack-plugin](https://github.com/microsoft/license-checker-webpack-plugin).

Please note that circular dependencies can occur in general, when bundling. For further discussion, see https://github.com/nodejs/readable-stream/issues/348

## Usage
add a rollup/vite config (e.g. rollup.config.js) to your project. Add `filter` to hide dependencies or add `extra` manually.
```javascript
import LicensePlugin from 'rollup-plugin-oss';
export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [
    LicensePlugin({
      filter: /@mycompany\/.*/,
      extra: [
        {
          name: 'Google Roboto font',
          version: '29',
          author: 'Christian Robertson',
          license: 'Apache-2.0',
          repository: 'https://github.com/googlefonts/roboto',
          description: 'downloaded from https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxK.woff2'
        }
      ]
    })
  ]
};
```

## Example output
This is the `disclosure.json` of this library. It's produced by `pnpm run build && pnpm run bundle`
```json
{
  "libraries": [
    {
      "name": "tslib",
      "version": "2.4.0",
      "author": "Microsoft Corp.",
      "license": "0BSD",
      "licenseText": "Copyright (c) Microsoft Corporation.\r\n\r\nPermission to use, copy, modify, and/or distribute this software for any\r\npurpose with or without fee is hereby granted.\r\n\r\nTHE SOFTWARE IS PROVIDED \"AS IS\" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH\r\nREGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY\r\nAND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,\r\nINDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM\r\nLOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR\r\nOTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR\r\nPERFORMANCE OF THIS SOFTWARE.",
      "repository": "https://github.com/Microsoft/tslib",
      "description": "Runtime library for TypeScript helper functions"
    }
  ]
}
```
Accordingly, you'll find in `src.zip`:
```bash
user@host dist % unzip src.zip
Archive:  src.zip
  inflating: tslib/package.json
  inflating: tslib/LICENSE.txt
  inflating: tslib/tslib.es6.js
```

## License
MIT
