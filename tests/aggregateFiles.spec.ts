import assert from 'node:assert';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { aggregateFiles } from '../src/index';

const { resolve } = createRequire(dirname(fileURLToPath(import.meta.url)));

describe('gets text for license definition', () => {
  it('fixed given license text', async () => {
    const libraries = await aggregateFiles(
      ['tslib', '@antfu/eslint-config'].map((file) => resolve(file))
    );
    assert(Array.isArray(libraries));
    for (const value of libraries) {
      assert(value == null
        || Object.entries(value).every(([key, value]) =>
          ['author', 'description', 'license', 'licenseText', 'name', 'repository', 'version'].includes(key)
          && typeof value === 'string'
        ));
    }
  });

  it('ignore unknown package', async () => {
    const libraries = await aggregateFiles(['@one/too/three']);
    assert(libraries.length === 0);
  });

  it('ignore filtered package', async () => {
    const libraries = await aggregateFiles([resolve('tslib')], undefined, /ts/);
    assert(libraries.length === 0);
  });

  it('ignore filtered package', async () => {
    const packerArguments: Array<string> = [],
      result = await aggregateFiles([resolve('tslib')], (data, filename) => packerArguments.push(filename));
    assert.deepStrictEqual(result, [{
      author: 'Microsoft Corp.',
      description: 'Runtime library for TypeScript helper functions',
      license: '0BSD',
      licenseText: 'Copyright (c) Microsoft Corporation.\r\n'
        + '\r\n'
        + 'Permission to use, copy, modify, and/or distribute this software for any\r\n'
        + 'purpose with or without fee is hereby granted.\r\n'
        + '\r\n'
        + 'THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH\r\n'
        + 'REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY\r\n'
        + 'AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,\r\n'
        + 'INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM\r\n'
        + 'LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR\r\n'
        + 'OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR\r\n'
        + 'PERFORMANCE OF THIS SOFTWARE.',
      name: 'tslib',
      repository: 'https://github.com/Microsoft/tslib',
      version: '2.8.1'
    }]);
    assert.deepStrictEqual(packerArguments, [
      'tslib@2.8.1/package.json',
      'tslib@2.8.1/LICENSE.txt',
      'tslib@2.8.1/tslib.js'
    ]);
  });
});
