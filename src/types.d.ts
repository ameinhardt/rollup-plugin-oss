export interface License {
  author?: string
  description?: string
  license: string
  licenseText?: string
  name: string
  repository: string
  version: string
}

export interface PluginConfig {
  extra?: Array<License>
  filter?: RegExp | string
  jsonFilename?: null | string
  zipFilename?: null | string
}

export interface LicenseDependency {
  files: Set<string>
  meta: License
}

export type Repository = {
  directory?: string
  type: string
  url: string
} | string;
export interface LicenseInfo {
  exception?: string
  license: string
  plus?: true
}
export interface ConjuctionInfo {
  conjunction: 'and' | 'or'
  left: ConjuctionInfo | LicenseInfo
  right: ConjuctionInfo | LicenseInfo
}

export type SpdxInfo = ConjuctionInfo | LicenseInfo;

export interface LicenseDatabase {
  exceptions: Record<string, string>
  licenses: Record<string, string>
}

export interface packageJsonType {
  author: string
  description: string
  license: string
  licenses: Record<string, string>
  licenseText: string
  name: string
  repository: Repository
  version: string
}
