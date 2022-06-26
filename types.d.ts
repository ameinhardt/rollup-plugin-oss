export interface License {
  name: string;
  version: string;
  author?: string;
  license: string;
  licenseText?: string;
  repository: string;
  description?: string;
}

export interface PluginConfig {
  filter?: RegExp | string;
  extra?: Array<License>,
  zipFilename?: string | null;
  jsonFilename?: string | null;
}

export interface LicenseDependency {
  meta: License;
  files: Set<string>
}

export type Repository = string | {
    type: string;
    url: string;
    directory?: string;
}
export interface LicenseInfo {
    license: string;
    exception?: string;
    plus?: true;
}
export interface ConjuctionInfo {
    conjunction: 'and' | 'or';
    left: LicenseInfo | ConjuctionInfo;
    right: LicenseInfo | ConjuctionInfo;
}

export type SpdxInfo = LicenseInfo | ConjuctionInfo;

export interface LicenseDatabase {
  licenses: Record<string, string>,
  exceptions: Record<string, string>
}
