# Rollup Plugin OSS

[Rollup](https://rollupjs.org/) is a module bundler for JavaScript. It knows best which sourcecode it bundles.\
This plugin hooks into the bundling step of rollup to
* traces back the corresponding `package.json` of each bundled source file for (version, license and other) information
* collects information of all used packages and adds them in a json (default `disclosure.json`) to the rollup bundle
  * parses the `package.json` license field according to the [spdx license expression definition](https://spdx.dev/spdx-specification-21-web-version/#h.jxpfx0ykyb60)
  * aborts if ambiguous ("or" connected) license definition is found
  * records either a given license file or ammends the text based on [the related spdx license texts](https://github.com/spdx/license-list-data)
* zips all used source files, package.json and found license files, grouped by package, in a zip (default `src.zip`)

This also works with [vite](https://vitejs.dev/).
The behavior is similiar to [license-checker-webpack-plugin](https://github.com/microsoft/license-checker-webpack-plugin).

Please note that circular dependencies can occur in general, when bundling. For further discussion, see https://github.com/nodejs/readable-stream/issues/348

## Usage
Install this package as development dependency
```bash
npm install -D rollup-plugin-oss
```
Add a rollup/vite config (e.g. rollup.config.js) to your project. Add `filter` to hide dependencies, add `extra` manually or adjust the output of the zip or json files.
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
      extra: [{
        license: 'CC0-1.0',
        name: 'license-list-xml',
        repository: 'https://github.com/spdx/license-list-XML',
        version: '2.6.0',
        author: 'Linux Foundation and its Contributors',
        description: 'The SPDX License List is a list of commonly found licenses and exceptions used for open source and other collaborative software.  The XML format is an internal representation of the licenses.  See the license-list-data for supported formats for the license list.'
      }],
      zipFilename: 'src.zip',
      jsonFilename: 'disclosure.json'
    })
  ]
};
```

## Test
Tests are run by [jest](https://jestjs.io/). If test coverage shows 0%, try to delete the compiled `index.js` first.

## Example output
Get an example output for this library by running cloning the repository (with `--recurse-submodules`)
```bash
npm install
npm run build # prebuilds automatically
npm run bundle
```
or for pnpm
``` bash
pnpm prebuild # trigger prebuild explicitly
pnpm build
pnpm bundle
```
In `./example` folder, you'll get a `disclosure.json` file with:
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
    },
    ...
  ]
}
```
Accordingly, you'll find in `src.zip`:
```bash
user@host example % unzip src.zip
Archive:  src.zip
  inflating: tslib@2.4.0/package.json
  inflating: tslib@2.4.0/LICENSE.txt
  inflating: tslib@2.4.0/tslib.es6.js
  ...
```

## License
MIT
