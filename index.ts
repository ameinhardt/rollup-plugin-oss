/* eslint-disable eslint-comments/disable-enable-pair */
import { createReadStream, createWriteStream, readFileSync, ReadStream } from 'node:fs';
import { access, readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import util from 'node:util';
import nearley from 'nearley';
import { OutputPlugin } from 'rollup';
import Packer from 'zip-stream';
import spdxExpression from './spdxExpression';
import { LicenseDependency, PluginConfig, Repository, SpdxInfo, LicenseInfo, ConjuctionInfo, LicenseDatabase, packageJsonType, License } from './types';

const moduleRe = /^(.*[/\\]node_modules[/\\]((?:@[^/\\]+[/\\])?[^/\\]+))[/\\]([^#?]+)/,
  licenseRe = /^li[cs]ense/i,
  // eslint-disable-next-line unicorn/prefer-module
  spdxData = readFileSync(join(__dirname, '/spdx.json')),
  spdxLicenseList : LicenseDatabase = JSON.parse(spdxData.toString());

function * flatten(ast: SpdxInfo, key: 'license' | 'conjunction') : Generator<SpdxInfo> {
  if (Object.prototype.hasOwnProperty.call(ast, 'license')) {
    const licenseInfo = ast as LicenseInfo;
    if (key === 'license') {
      yield licenseInfo;
    }
  } else {
    const conjuctionInfo = ast as ConjuctionInfo;
    if (conjuctionInfo.right) {
      yield * flatten(conjuctionInfo.right, key);
    }
    if (conjuctionInfo.left) {
      yield * flatten(conjuctionInfo.left, key);
    }
    if (key === 'conjunction') {
      yield conjuctionInfo;
    }
  }
}

function getLicenses(license: Record<string, string> | string) : { infos: Array<LicenseInfo>, license: string } {
  if (typeof license === 'object' && typeof license.type) {
    license = license.type;
  }
  if (typeof license !== 'string') {
    throw new TypeError("can't parse license");
  }
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(spdxExpression));
  try {
    parser.feed(license);
  } catch {
    throw new Error("can't parse license definition");
  }
  if (parser.results.length !== 1) {
    throw new Error("can't unambiguously parse license definition");
  }
  const parsedSpdx = parser.results[0];
  for (const { conjunction } of flatten(parsedSpdx, 'conjunction') as Generator<ConjuctionInfo>) {
    if (conjunction.toLocaleLowerCase() === 'or') {
      throw new Error('found multiple license options');
    }
  }
  return {
    infos: [...flatten(parsedSpdx, 'license') as Generator<LicenseInfo>],
    license
  };
}

async function getLicenseFile(modulePath: string): Promise<{ fileName: string, text: string} | undefined> {
  const list = await readdir(modulePath),
    fileName = list.find((f) => f.match(licenseRe));
  if (fileName) {
    const data = await readFile(join(modulePath, fileName));
    return { fileName, text: data.toString('utf8') };
  }
}

// parses https://docs.npmjs.com/cli/v8/configuring-npm/package-json#repository to a simple string
function getRepository(repository: Repository) : string {
  if (typeof repository === 'object') {
    repository = repository.url;
  }
  if (typeof repository !== 'string' || repository.length === 0) {
    return '';
  }
  const gist = repository.match(/^gist:(.*)$/);
  if (gist) {
    return `https://gist.github.com/${gist[1]}`;
  }
  const alias = repository.match(/^(?:(github|bitbucket|gitlab):)?([^/]+)\/([^/]+)$/);
  if (alias) {
    let host = 'https://github.com';
    if (alias[1] === 'bitbucket') {
      host = 'https://bitbucket.org';
    } else if (alias[1] === 'gitlab') {
      host = 'https://gitlab.com';
    }
    return `${host}/${alias[2]}/${alias[3]}`;
  }
  return repository
    .replace(/^(git(\+(ssh|https?))):\/\//, 'https://')
    .replace(/git@github.com/, 'github.com')
    .replace(/.git$/, '');
}

function getLicenseText(infos: LicenseInfo[]) {
  let licenseText = '';
  for (const info of infos) {
    if (!spdxLicenseList.licenses[info.license]) {
      throw new Error(`can't find license text for "${info.license}}"`);
    }
    licenseText += `${spdxLicenseList.licenses[info.license]}\n`;
    if (info.exception) {
      if (!spdxLicenseList.exceptions[info.exception]) {
        throw new Error(`can't find exception text for "${info.exception}}"`);
      }
      licenseText += `${spdxLicenseList.exceptions[info.exception]}\n`;
    }
    licenseText += '\n';
  }
  return licenseText;
}

function getVersionName(cache: LicenseDependency) {
  return `${cache.meta.name}@${cache.meta.version}`;
}

function getMeta(packageData: packageJsonType, licenseText?:string) : License  {
  const { license, infos } = getLicenses(packageData.license || packageData.licenses);
  return {
    name: packageData.name,
    version: packageData.version,
    author: packageData.author,
    license,
    licenseText: packageData.licenseText || licenseText || getLicenseText(infos),
    repository: getRepository(packageData.repository),
    description: packageData.description
  };
}

async function aggregateFiles(moduleIds: Array<string>, packerFunction?: (content: Buffer | ReadStream | string, name: string) => void, filter?: RegExp | string) {
  const libraryMap: Map<string, LicenseDependency | null> = new Map();
  for (const moduleId of moduleIds) {
    const splitPath = moduleId.match(moduleRe);
    if (!splitPath) {
      continue;
    }
    const [, modulePath, moduleName, fileName] = splitPath;
    let cache = libraryMap.get(modulePath);
    if ((filter && !!~moduleName.search(filter)) || cache === null) { // if filtered or ran into error
      continue;
    }
    if (!cache) {
      try {
        const files: Set<string> = new Set(),
          [packageJson, licenseFile] = await Promise.all([
            readFile(join(modulePath, 'package.json')),
            getLicenseFile(modulePath)
          ]),
          packageData = JSON.parse(packageJson.toString()),
          meta = getMeta(packageData, licenseFile?.text);
        cache = {
          meta,
          files
        };
        files.add('package.json');
        await packerFunction?.(packageJson, `${getVersionName(cache)}/package.json`);
        if (licenseFile) {
          files.add(licenseFile.fileName);
          await packerFunction?.(licenseFile.text, `${getVersionName(cache)}/${licenseFile.fileName}`);
        }
      } catch (error) {
        console.error(`can't read package ${moduleName}. Skipping`, error);
        cache = null;
        continue;
      } finally {
        libraryMap.set(modulePath, cache ?? null);
      }
    }
    if (cache.files.has(fileName)) {
      console.warn('file already registered', modulePath, fileName); // how?
      continue;
    }
    try {
      const fullPath = join(modulePath, fileName);
      // await access(fullPath);
      await packerFunction?.(createReadStream(fullPath), `${getVersionName(cache)}/${fileName}`);
    } catch (error) {
      console.error(`can't read file ${getVersionName(cache)}/${fileName}. Skipping`, error);
      continue;
    }
  }
  return [...libraryMap.values()].filter(Boolean).map((dependency) => dependency?.meta);
}

async function assureDirectory(filepath: string) : Promise<boolean> {
  const directory = dirname(filepath);
  try {
    await access(directory);
    return true;
  } catch {
    await mkdir(directory, { recursive: true });
    return false;
  }
}

/* istanbul ignore next */
function LicensePlugin({ filter, extra = [], jsonFilename = 'disclosure.json', zipFilename = 'src.zip' }: PluginConfig = {}) : OutputPlugin {
  return {
    name: 'rollup-plugin-license',
    async generateBundle(outputOptions) {
      const outDirectory = outputOptions.dir ?? (outputOptions.file && dirname(outputOptions.file)) ?? process.cwd(),
        moduleIds = [...this.getModuleIds()].filter(
          (moduleId) => !moduleId.startsWith('\0') && this.getModuleInfo(moduleId)?.isIncluded
        );
      let libraries;
      if (zipFilename != null) {
        const zipFilePath = join(outDirectory, zipFilename),
          zip = new Packer({
            zlib: { level: 9 }
          }),
          zipEntry = util.promisify(zip.entry).bind(zip);
        await assureDirectory(zipFilePath);
        zip.pipe(createWriteStream(zipFilePath));
        libraries = await aggregateFiles(moduleIds, (content, name) => zipEntry(content, { name }), filter);
        zip?.finalize();
      } else {
        libraries = await aggregateFiles(moduleIds, undefined, filter);
      }
      if (jsonFilename != null) {
        const jsonFilePath = join(outDirectory, jsonFilename);
        await assureDirectory(jsonFilePath);
        await writeFile(jsonFilePath, JSON.stringify({
          libraries: [...libraries, ...extra]
        }, null, 2));
      }
    }
  };
}

export { aggregateFiles, getLicenses, getMeta, getLicenseText, getRepository };

export default LicensePlugin;
