const { FlatCompat } = require('@eslint/eslintrc');

// ESLint v9 uses flat config by default. Keep our existing .eslintrc.js rules via compat
// so `npm run lint` works in CI/local without a big migration.
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.config({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    env: {
      node: true,
      jest: true,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }),
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
];
