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
  extra?: Array<License>
}

export interface LicenseDependency {
  meta: License;
  files: Set<string>
}
