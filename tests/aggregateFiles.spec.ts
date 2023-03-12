/* eslint-disable eslint-comments/disable-enable-pair */
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aggregateFiles } from '../index';

const { resolve } = createRequire(dirname(fileURLToPath(import.meta.url)));

describe('gets text for license definition', function() {
  it('fixed given license text', async function() {
    const libraries = await aggregateFiles(
      ['tslib', '@ameinhardt/eslint-config', '@ameinhardt/eslint-config/typescript'].map((file) => resolve(file))
    );
    expect(libraries).toBeInstanceOf(Array);
    for (const value of libraries) {
      expect(value).toEqual(expect.objectContaining({
        author: expect.any(String),
        license: expect.any(String),
        licenseText: expect.any(String),
        name: expect.any(String),
        repository: expect.any(String),
        version: expect.any(String)
      }));
    }
  });

  it('ignore unknown package', async function() {
    const libraries = await aggregateFiles(['@one/too/three']);
    expect(libraries.length).toBe(0);
  });

  it('ignore filtered package', async function() {
    const libraries = await aggregateFiles([resolve('tslib')], undefined, /ts/);
    expect(libraries.length).toBe(0);
  });

  it('ignore filtered package', async function() {
    const packerArguments : Array<string> = [],
      result = await aggregateFiles([resolve('tslib')], (data, filename) => packerArguments.push(filename));
    expect(result).toMatchSnapshot();
    expect(packerArguments).toMatchSnapshot();
  });
});
