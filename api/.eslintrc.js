const path = require('path');
const aliases = require('./aliases');

module.exports = {
  settings: {
    'import/resolver': {
      alias: {
        map: (
          Object.keys(
            aliases,
          ).map(moduleName => ([
            moduleName,
            aliases[moduleName],
          ]))
        ),
      },
    },
  },
  parser: 'babel-eslint',
  parserOptions: {
    allowImportExportEverywhere: true,
  },
  extends: [
    'airbnb/base',
  ],
  rules: {
    'flowtype/generic-spacing': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'function-paren-newline': [
      'error',
      'consistent',
    ],
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          consistent: true,
        },
        ObjectPattern: {
          multiline: true,
        },
        ImportDeclaration: 'always',
        ExportDeclaration: 'always',
    }],
  },
  env: {
    browser: true,
    mocha: true,
    node: true,
  },
};
