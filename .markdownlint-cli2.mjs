
// const extraRules = require("extraRules");
import markdownlint from 'markdownlint';
import titleCaseStyle from 'markdownlint-rule-title-case-style';
import { load } from 'js-yaml';

export default {
    'customRules': [ titleCaseStyle ],
    'config': markdownlint.readConfigSync('./.markdownlint.yml', [ load ]),
};
