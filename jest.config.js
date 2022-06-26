/* eslint-disable unicorn/prefer-module, eslint-comments/disable-enable-pair */
module.exports = async () => {
  return {
    verbose: true,
    preset: 'ts-jest',
    moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
    collectCoverage: true,
    collectCoverageFrom: ['index.ts'],
    transform: {
      '\\.ts$': 'ts-jest'
    },
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
