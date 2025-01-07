import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      extends: 'plugin:@next/next/recommended',
      react: {
        version: 'detect'
      }
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/prop-types': ['off']
    }
  }
];
