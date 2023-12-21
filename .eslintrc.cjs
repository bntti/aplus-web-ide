module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'google',
        'plugin:prettier/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
    parser: '@typescript-eslint/parser',
    parserOptions: { project: './tsconfig.json' },
    plugins: ['react-refresh', 'prettier', 'import'],
    settings: {
        'import/resolver': {
            typescript: {
                project: './tsconfig.json',
            },
        },
    },
    rules: {
        'no-constant-condition': ['error', { checkLoops: false }],
        'require-jsdoc': 'off',
        'no-unused-vars': 'warn',
        'spaced-comment': ['error', 'always', { markers: ['/'] }],
        eqeqeq: 'error',
        'dot-notation': 'error',
        'import/no-unresolved': 'error',
        'import/order': [
            'warn',
            {
                groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index', 'unknown'],
                'newlines-between': 'always',
            },
        ],
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-use-before-define': ['error'],
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
};
