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
    settings: {
      react: {
        version: '16'
      }
    },
    rules: {
      // These rules are not appropriate for linting markdown code blocks
      'lines-around-comment': 'off',
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'react/jsx-no-undef': 'off',
      'no-undef': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'brace-style': 'off', // it's useful to have comments before the else block
      // These rules are disabled because they are difficult to adhere to right now
      'jsx-a11y/label-has-associated-control': 'off',
      'react/prefer-stateless-function': 'off',
    }
  }
];

module.exports = rules;
