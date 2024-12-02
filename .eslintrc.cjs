module.exports = {
  env: {
    node: true,
  },
  extends: ['plugin:prettier/recommended', 'plugin:unicorn/recommended'],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:sonarjs/recommended',
      ],
      plugins: ['import', 'unused-imports', 'sonarjs'],
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: 'tsconfig.json',
          },
        },
      },
      rules: {
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
              'object',
              'type',
            ],
            alphabetize: { order: 'asc', caseInsensitive: true },
            'newlines-between': 'always',
          },
        ],
        'import/newline-after-import': 'error',
        'import/no-unused-modules': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
          },
        ],
        'unused-imports/no-unused-imports-ts': ['error'],
        'unused-imports/no-unused-vars-ts': [
          'warn',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
          },
        ],
        'unicorn/catch-error-name': [
          'error',
          {
            name: 'err',
          },
        ],
        'unicorn/filename-case': 'off',
        'unicorn/consistent-function-scoping': 'off',
        'unicorn/prevent-abbreviations': [
          'warn',
          {
            checkFilenames: false,
          },
        ],
        'unicorn/no-array-reduce': 'off',
        'sonarjs/cognitive-complexity': 'off',
      },
    },
  ],
};
