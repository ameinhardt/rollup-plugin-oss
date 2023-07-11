/* eslint-disable eslint-comments/disable-enable-pair */
export default async () => {
  return {
    verbose: false,
    preset: 'ts-jest/presets/default-esm',
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          tsconfig: 'tsconfig.json',
          useESM: true
        }
      ]
    },
    moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
    collectCoverage: true,
    collectCoverageFrom: ['index.js'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    coverageReporters: ['text', 'text-summary'],
    testRegex: './tests/.*\\.spec\\.(js|ts)$',
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/coverage/']
  };
};
