/* eslint no-console: ['error', { allow: ['info'] }] */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import nearley from 'nearley';
import Compile from 'nearley/lib/compile.js';
import generate from 'nearley/lib/generate.js';
import nearleyGrammar from 'nearley/lib/nearley-language-bootstrapped.js';

async function buildLicenseDatabase() {
  const basedir = './license-list-data/json',
    outfile = './spdx.json',
    [licenseFiles, exceptionFiles] = await Promise.all([
      readdir(`${basedir}/details`),
      readdir(`${basedir}/exceptions`)
    ]),
    licenses = {},
    exceptions = {};
  console.info(`database: reading ${licenseFiles.length} licenses`);
  for (const filename of licenseFiles) {
    const data = await readFile(`${basedir}/details/${filename}`),
      detail = JSON.parse(data);
    licenses[detail.licenseId] = detail.licenseText.normalize('NFD').replace(/\s/g, ' ');
  }
  console.info(`database: reading ${exceptionFiles.length} exceptions`);
  for (const filename of exceptionFiles) {
    const data = await readFile(`${basedir}/exceptions/${filename}`),
      exception = JSON.parse(data);
    exceptions[exception.licenseExceptionId] = exception.licenseExceptionText.normalize('NFD').replace(/\s/g, ' ');
  }
  console.info(`database: writing ${outfile}`);
  await writeFile(outfile, JSON.stringify({
    licenses,
    exceptions
  }, null, 2));
}

async function buildLicenseParser() {
  const outfile = './spdxExpression.ts',
    parserGrammar = nearley.Grammar.fromCompiled(nearleyGrammar),
    parser = new nearley.Parser(parserGrammar),
    grammar = await readFile('./spdxExpression.ne');
  parser.feed(grammar.toString());
  const c = Compile(parser.results[0], {});
  console.info(`parser:   writing ${outfile}`);
  writeFile(outfile, generate(c));
}

buildLicenseDatabase();
buildLicenseParser();
