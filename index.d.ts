import { OutputPlugin } from 'rollup';
import { PluginConfig } from './types';
declare function LicensePlugin({ filter, extra }?: PluginConfig): OutputPlugin;
export default LicensePlugin;
