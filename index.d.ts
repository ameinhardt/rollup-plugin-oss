/// <reference types="node" />
/// <reference types="node" />
import { Stream } from 'node:stream';
import { OutputPlugin } from 'rollup';
import { LicenseDependency, PluginConfig, Repository, LicenseInfo } from './types';
declare function getLicenses(license: Record<string, string> | string): {
    infos: Array<LicenseInfo>;
    license: string;
};
declare function getRepository(repository: Repository): string;
declare function getLicenseText(infos: LicenseInfo[]): string;
declare function aggregateFiles(moduleIds: Array<string>, packerFunction?: (content: Buffer | Stream | string, name: string) => void, filter?: RegExp | string): Promise<Map<string, LicenseDependency>>;
declare function LicensePlugin({ filter, extra, jsonFilename, zipFilename }?: PluginConfig): OutputPlugin;
export { aggregateFiles, getLicenses, getLicenseText, getRepository };
export default LicensePlugin;
