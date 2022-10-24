/// <reference types="node" />
/// <reference types="node" />
import { ReadStream } from 'node:fs';
import { OutputPlugin } from 'rollup';
import { PluginConfig, Repository, LicenseInfo, packageJsonType, License } from './types';
declare function getLicenses(license: Record<string, string> | string): {
    infos: Array<LicenseInfo>;
    license: string;
};
declare function getRepository(repository: Repository): string;
declare function getLicenseText(infos: LicenseInfo[]): string;
declare function getMeta(packageData: packageJsonType, licenseText?: string): License;
declare function aggregateFiles(moduleIds: Array<string>, packerFunction?: (content: Buffer | ReadStream | string, name: string) => void, filter?: RegExp | string): Promise<(License | undefined)[]>;
declare function LicensePlugin({ filter, extra, jsonFilename, zipFilename }?: PluginConfig): OutputPlugin;
export { aggregateFiles, getLicenses, getMeta, getLicenseText, getRepository };
export default LicensePlugin;
