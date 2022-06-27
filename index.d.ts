/// <reference types="node" />
/// <reference types="node" />
import { ReadStream } from 'node:fs';
import { OutputPlugin } from 'rollup';
import { License, PluginConfig, Repository, LicenseInfo } from './types';
declare function getLicenses(license: Record<string, string> | string): {
    infos: Array<LicenseInfo>;
    license: string;
};
declare function getRepository(repository: Repository): string;
declare function getLicenseText(infos: LicenseInfo[]): string;
declare function aggregateFiles(moduleIds: Array<string>, packerFunction?: (content: Buffer | ReadStream | string, name: string) => void, filter?: RegExp | string): Promise<License[]>;
declare function LicensePlugin({ filter, extra, jsonFilename, zipFilename }?: PluginConfig): OutputPlugin;
export { aggregateFiles, getLicenses, getLicenseText, getRepository };
export default LicensePlugin;
