/* eslint-disable eslint-comments/disable-enable-pair */
import { createReadStream, createWriteStream } from 'node:fs';
import { access, readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Stream } from 'node:stream';
import util from 'node:util';
import { OutputPlugin } from 'rollup';
import spdxLicenseList from 'spdx-license-list/full';
import Packer from 'zip-stream';
import { LicenseDependency, License, PluginConfig } from './types';

const moduleRe = /^(.*[/\\]node_modules[/\\]((?:@[^/\\]+[/\\])?[^/\\]+))[/\\]([^#?]+)/,
  licenseRe = /li[cs]ense/i;

function getLicense(license: Array<Record<string, string>> | Record<string, string> | string) : string {
  if (Array.isArray(license)) {
    return license.map((l) => getLicense(l)).join(', ');
  } else if (typeof license === 'object' && typeof license.type) {
    return license.type;
  } if (typeof license === 'string') {
    return license;
  }
  return 'unknown';
}

function getRepository(repository: Record<string, string> | string) : string {
  if (typeof repository === 'object') {
    repository = repository.url;
  }
  if (typeof repository !== 'string' || repository.length === 0) {
    return '';
  }
  return repository
    .replace('git+ssh://git@', 'git://')
    .replace('git+https://github.com', 'https://github.com')
    .replace('git://github.com', 'https://github.com')
    .replace('git@github.com:', 'https://github.com/')
    .replace('.git', '');
}

async function getLicenseFile(modulePath: string): Promise<[string, Buffer] | undefined> {
  const list = await readdir(modulePath),
    fileName = list.find((f) => f.match(licenseRe));
  if (fileName) {
    const data = await readFile(path.join(modulePath, fileName));
    return [fileName, data];
  }
}

async function aggregateFiles(moduleIds: Array<string>, packerFunction: (content: Buffer | Stream | string, name: string) => void, filter?: RegExp | string) {
  const libraryMap: Map<string, LicenseDependency> = new Map();
  for (const moduleId of moduleIds) {
    const splitPath = moduleId.match(moduleRe);
    if (!splitPath) {
      continue;
    }
    const [, modulePath, moduleName, fileName] = splitPath;
    if (filter && !~moduleName.search(filter)) {
      continue;
    }
    let cache = libraryMap.get(modulePath);
    if (!cache) {
      try {
        const files: Set<string> = new Set(),
          [packageJson, licenseFile] = await Promise.all([
            readFile(path.join(modulePath, 'package.json')),
            getLicenseFile(modulePath)
          ]),
          meta = {} as Partial<License>;
        files.add('package.json');
        await packerFunction?.(packageJson, `${moduleName}/package.json`);
        if (licenseFile) {
          files.add(licenseFile[0]);
          await packerFunction?.(licenseFile[1], `${moduleName}/${licenseFile[0]}`);
        }
        const packageData = JSON.parse(packageJson.toString()),
          license = getLicense(packageData.license || packageData.licenses);
        Object.assign(meta, {
          name: packageData.name,
          version: packageData.version,
          author: packageData.author,
          license,
          licenseText:
            packageData.licenseText || (licenseFile && licenseFile[1].toString('utf8')) || spdxLicenseList[license],
          repository: getRepository(packageData.repository),
          description: packageData.description
        });
        cache = { meta: meta as License, files };
        libraryMap.set(modulePath, cache);
      } catch (error) {
        console.error(`can't read package ${moduleName}. Skipping`, error);
        continue;
      }
    }
    if (cache.files.has(fileName)) {
      console.warn('file already registered', modulePath, fileName); // how?
      continue;
    }
    try {
      const fullPath = path.join(modulePath, fileName);
      // await access(fullPath);
      await packerFunction?.(createReadStream(fullPath), `${moduleName}/${fileName}`);
    } catch (error) {
      console.error(`can't read file ${moduleName}/${fileName}. Skipping`, error);
      continue;
    }
  }
  return libraryMap;
}

function LicensePlugin({ filter, extra = [] }: PluginConfig = {}) : OutputPlugin {
  return {
    name: 'rollup-plugin-license',
    async generateBundle(outputOptions) {
      const outDirectory = outputOptions.dir ?? (outputOptions.file && path.dirname(outputOptions.file)) ?? process.cwd(),
        moduleIds = [...this.getModuleIds()].filter(
          (moduleId) => !moduleId.startsWith('\0') && this.getModuleInfo(moduleId)?.isIncluded
        ),
        zip = new Packer({
          zlib: { level: 9 }
        }),
        zipEntry = util.promisify(zip.entry).bind(zip);
      // create outDirectory?
      try {
        await access(outDirectory);
      } catch {
        await mkdir(outDirectory, { recursive: true });
      }
      zip.pipe(createWriteStream(path.join(outDirectory, 'src.zip')));
      const libraryMap = await aggregateFiles(moduleIds, (content, name) => zipEntry(content, { name }), filter);
      zip.finalize();
      const libraries = [...libraryMap.values()].map(({ meta }) => meta, ...extra);
      await writeFile(path.join(outDirectory, 'disclosure.json'), JSON.stringify({ libraries }, null, 2));
    }
  };
}

export default LicensePlugin;
