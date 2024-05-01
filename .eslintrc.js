module.exports = {
    extends: ['eslint:recommended', 'prettier'],
    root: true,
    overrides: [
        {
            files: ['**/*.jsx', '**/*.tsx'],
            extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
            plugins: ['react', 'react-hooks'],
            rules: {
                'react/no-unknown-property': 'off',
                'react-hooks/exhaustive-deps': 'error',
                'react/react-in-jsx-scope': 'off',
            },
        },
        {
            files: ['**/*.ts', '**/*.tsx'],
            extends: ['plugin:@typescript-eslint/recommended'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            rules: {
                '@typescript-eslint/prefer-namespace-keyword': 'off',
                '@typescript-eslint/no-namespace': 'off',
            },
        },
        {
            files: ['**/.eslintrc.js', '**/babel.config.js', '**/webpack.config.js'],
            env: { node: true, es6: true },
        },
    ],
    ignorePatterns: ['**/build/**/*'],
};
