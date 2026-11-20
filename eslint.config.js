import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import prettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage', 'public/mockServiceWorker.js']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'feature-entry', pattern: 'src/features/*/index.ts' },
        { type: 'feature', pattern: 'src/features/**' },
        { type: 'component', pattern: 'src/components/**' },
        { type: 'lib', pattern: 'src/lib/**' },
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/*.test.tsx', '**/*.testSetup.ts'],
      'boundaries/legacy-warnings': false,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              from: 'lib',
              disallow: ['app', 'feature', 'feature-entry', 'component'],
            },
            {
              from: 'component',
              disallow: ['app', 'feature'],
            },
            {
              from: 'feature',
              disallow: ['app'],
            },
            {
              from: 'feature-entry',
              disallow: ['app'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/app/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['src/features/*/*', '!src/features/*/index.ts'],
              message: 'Import a feature only through its index.ts entry point.',
            },
          ],
        },
      ],
    },
  },
])
