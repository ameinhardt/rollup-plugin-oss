module.exports = {
  env: {
    browser: false,
    node: true
  },
  ignorePatterns: ['spdxExpression.*', 'spdx.json', 'package-lock.json', 'license-list-data/**', 'index.js'],
  extends: [
    '@ameinhardt/eslint-config/typescript'
  ],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }]
  }
};
