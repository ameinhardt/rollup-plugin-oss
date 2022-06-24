module.exports = {
  env: {
    browser: false,
    node: true
  },
  extends: [
    '@ameinhardt/eslint-config/typescript'
  ],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }]
  }
};
