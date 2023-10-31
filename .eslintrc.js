const rules = require('@silverstripe/eslint-config/.eslintrc');

rules.plugins = ['markdown'];
rules.overrides = [
  {
    files: ['**/*.md'],
    processor: 'markdown/markdown'
  },
  {
    files: ['**/*.md/*.js'],
    parserOptions: {
      ecmaFeatures: {
        impliedStrict: true
      }
    },
    rules: {
      'lines-around-comment': 'off',
      'import/no-unresolved': 'off',
      'no-undef': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
    }
  }
];

module.exports = rules;
