/* eslint no-console: ['error', { allow: ['info'] }] */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nearley from 'nearley';
import Compile from 'nearley/lib/compile.js';
import generate from 'nearley/lib/generate.js';
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js';

const srcDir = dirname(fileURLToPath(import.meta.url));

async function buildLicenseDatabase() {
  const basedir = '../license-list-data/json',
    outfile = '../spdx.json',
    [licenseFiles, exceptionFiles] = await Promise.all([
      readdir(resolve(srcDir, basedir, 'details')),
      readdir(resolve(srcDir, basedir, 'exceptions'))
    ]),
    licenses = {},
    exceptions = {};
  console.info(`database: reading ${licenseFiles.length} licenses`);
  for (const filename of licenseFiles) {
    const data = await readFile(resolve(srcDir, basedir, 'details', filename)),
      detail = JSON.parse(data);
    licenses[detail.licenseId] = detail.licenseText.normalize('NFD').replace(/\s/g, ' ');
  }
  console.info(`database: reading ${exceptionFiles.length} exceptions`);
  for (const filename of exceptionFiles) {
    const data = await readFile(resolve(srcDir, basedir, 'exceptions', filename)),
      exception = JSON.parse(data);
    exceptions[exception.licenseExceptionId] = exception.licenseExceptionText.normalize('NFD').replace(/\s/g, ' ');
  }
  console.info(`database: writing ${outfile}`);
  await writeFile(resolve(srcDir, outfile), JSON.stringify({
    licenses,
    exceptions
  }, null, 2));
}

async function buildLicenseParser() {
  const outfile = './spdxExpression.ts',
    parserGrammar = nearley.Grammar.fromCompiled(nearleyGrammar),
    parser = new nearley.Parser(parserGrammar),
    grammar = await readFile(resolve(srcDir, 'spdxExpression.ne'));
  parser.feed(grammar.toString());
  const c = Compile(parser.results[0], {});
  console.info(`parser:   writing ${outfile}`);
  writeFile(resolve(srcDir, outfile), generate(c));
}

// eslint-disable-next-line unicorn/prefer-top-level-await
buildLicenseDatabase();
// eslint-disable-next-line unicorn/prefer-top-level-await
buildLicenseParser();
