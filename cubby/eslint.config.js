const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['node_modules/*', '.expo/*', 'dist/*'],
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'react/display-name': 'off',
      'import/first': 'off',
    },
  },
]);
