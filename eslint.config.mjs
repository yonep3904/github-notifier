import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules', 'dist', 'coverage', 'worker-configuration.d.ts'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        fetch: false,
        Request: false,
        Response: false,
        addEventListener: false,
      },
    },

    rules: {
      // Basic
      'no-debugger': 'warn',
      'no-console': 'off',

      'no-empty': ['warn', { allowEmptyCatch: true }],
      'prefer-const': 'warn',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],

      // Import(Disable rules that conflict with Prettier)
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',

      'import/order': 'off',
      'import-x/order': 'off',
      'import-x/no-duplicates': 'off',

      // Node.js(Disable rules that are not suitable for Cloudflare Workers)
      'n/no-process-exit': 'off',
    },
  },

  prettier,
];
