"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable eslint-comments/disable-enable-pair */
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const node_util_1 = __importDefault(require("node:util"));
const full_1 = __importDefault(require("spdx-license-list/full"));
const zip_stream_1 = __importDefault(require("zip-stream"));
const moduleRe = /^(.*[/\\]node_modules[/\\]((?:@[^/\\]+[/\\])?[^/\\]+))[/\\]([^#?]+)/, licenseRe = /li[cs]ense/i;
function getLicense(license) {
    if (Array.isArray(license)) {
        return license.map((l) => getLicense(l)).join(', ');
    }
    else if (typeof license === 'object' && typeof license.type) {
        return license.type;
    }
    if (typeof license === 'string') {
        return license;
    }
    return 'unknown';
}
function getRepository(repository) {
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
function getLicenseFile(modulePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const list = yield (0, promises_1.readdir)(modulePath), fileName = list.find((f) => f.match(licenseRe));
        if (fileName) {
            const data = yield (0, promises_1.readFile)(node_path_1.default.join(modulePath, fileName));
            return [fileName, data];
        }
    });
}
function aggregateFiles(moduleIds, packerFunction, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const libraryMap = new Map();
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
                    const files = new Set(), [packageJson, licenseFile] = yield Promise.all([
                        (0, promises_1.readFile)(node_path_1.default.join(modulePath, 'package.json')),
                        getLicenseFile(modulePath)
                    ]), meta = {};
                    files.add('package.json');
                    yield (packerFunction === null || packerFunction === void 0 ? void 0 : packerFunction(packageJson, `${moduleName}/package.json`));
                    if (licenseFile) {
                        files.add(licenseFile[0]);
                        yield (packerFunction === null || packerFunction === void 0 ? void 0 : packerFunction(licenseFile[1], `${moduleName}/${licenseFile[0]}`));
                    }
                    const packageData = JSON.parse(packageJson.toString()), license = getLicense(packageData.license || packageData.licenses);
                    Object.assign(meta, {
                        name: packageData.name,
                        version: packageData.version,
                        author: packageData.author,
                        license,
                        licenseText: packageData.licenseText || (licenseFile && licenseFile[1].toString('utf8')) || full_1.default[license],
                        repository: getRepository(packageData.repository),
                        description: packageData.description
                    });
                    cache = { meta: meta, files };
                    libraryMap.set(modulePath, cache);
                }
                catch (error) {
                    console.error(`can't read package ${moduleName}. Skipping`, error);
                    continue;
                }
            }
            if (cache.files.has(fileName)) {
                console.warn('file already registered', modulePath, fileName); // how?
                continue;
            }
            try {
                const fullPath = node_path_1.default.join(modulePath, fileName);
                // await access(fullPath);
                yield (packerFunction === null || packerFunction === void 0 ? void 0 : packerFunction((0, node_fs_1.createReadStream)(fullPath), `${moduleName}/${fileName}`));
            }
            catch (error) {
                console.error(`can't read file ${moduleName}/${fileName}. Skipping`, error);
                continue;
            }
        }
        return libraryMap;
    });
}
function LicensePlugin({ filter, extra = [] } = {}) {
    return {
        name: 'rollup-plugin-license',
        generateBundle(outputOptions) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const outDirectory = (_b = (_a = outputOptions.dir) !== null && _a !== void 0 ? _a : (outputOptions.file && node_path_1.default.dirname(outputOptions.file))) !== null && _b !== void 0 ? _b : process.cwd(), moduleIds = [...this.getModuleIds()].filter((moduleId) => { var _a; return !moduleId.startsWith('\0') && ((_a = this.getModuleInfo(moduleId)) === null || _a === void 0 ? void 0 : _a.isIncluded); }), zip = new zip_stream_1.default({
                    zlib: { level: 9 }
                }), zipEntry = node_util_1.default.promisify(zip.entry).bind(zip);
                // create outDirectory?
                try {
                    yield (0, promises_1.access)(outDirectory);
                }
                catch (_c) {
                    yield (0, promises_1.mkdir)(outDirectory, { recursive: true });
                }
                zip.pipe((0, node_fs_1.createWriteStream)(node_path_1.default.join(outDirectory, 'src.zip')));
                const libraryMap = yield aggregateFiles(moduleIds, (content, name) => zipEntry(content, { name }), filter);
                zip.finalize();
                const libraries = [...libraryMap.values()].map(({ meta }) => meta, ...extra);
                yield (0, promises_1.writeFile)(node_path_1.default.join(outDirectory, 'disclosure.json'), JSON.stringify({ libraries }, null, 2));
            });
        }
    };
}
exports.default = LicensePlugin;
