import js from '@eslint/js';
import singlestoreReactHooksDisableImport from '@singlestore/eslint-plugin-react-hooks-disable-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist', 'scripts', 'src/api/schema.d.ts']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@singlestore/react-hooks-disable-import': singlestoreReactHooksDisableImport,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      sonarjs.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@singlestore/react-hooks-disable-import/react-hooks-disable-import': 'error',
      'sonarjs/no-ignored-exceptions': 'off',
    },
  },
  // Do not allow process.env in client code, as it is not replaced by Vite and will cause errors in the browser. Use import.meta.env instead.
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Use import.meta.env in Vite client code instead of process.env.',
        },
      ],
    },
  },
  // Allow process.env in config and scripts files
  {
    files: ['vite.config.*', 'vitest.config.*', 'playwright.config.*', 'scripts/**/*'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
    rules: {
      'no-restricted-properties': 'off',
    },
  },
  eslintConfigPrettier,
]);
