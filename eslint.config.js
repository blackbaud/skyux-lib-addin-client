// @ts-check
const angular = require('angular-eslint');
const tseslint = require('typescript-eslint');

/**
 * Requires the given prefix on every directive and component selector in a
 * project.
 */
function selectorRules(prefix) {
  return {
    '@angular-eslint/directive-selector': [
      'error',
      { type: 'attribute', prefix, style: 'camelCase' },
    ],
    '@angular-eslint/component-selector': [
      'error',
      { type: 'element', prefix, style: 'kebab-case' },
    ],
  };
}

module.exports = tseslint.config(
  {
    ignores: ['projects/addin-client/documentation/**'],
  },
  {
    files: ['projects/**/*.ts'],
    extends: [...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
  },
  {
    files: ['projects/addin-client/**/*.ts'],
    rules: selectorRules('lib'),
  },
  {
    files: ['projects/addin-client-showcase/**/*.ts'],
    rules: selectorRules('app'),
  },
  {
    files: ['projects/**/*.html'],
    extends: [...angular.configs.templateRecommended],
  },
);
