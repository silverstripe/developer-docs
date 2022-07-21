---
title: Upgrading to PHPUnit 9
summary: Guidance on upgrading your project or module to use PHPUnit 9
---

# Upgrading to PHPUnit 9

Silverstripe CMS 4 supported PHPUnit 5.7 _and_ 9.5 at the same time from 4.10 onwards. This dual support is not available in CMS 5, so any tests relying on PHPUnit 5.7 will need to be upgraded.

## How to upgrade from PHPUnit 5.7

Replace references to `"sminnee/phphunit": "5.7" `with `"phpunit/phpunit": "^9.5"` in the `"require-dev"` section of composer.json and run `composer update`.

If you are upgrading a module rather than a website, ensure there's a specific requirement for `silverstripe/framework`: `^4.10` as Silverstripe CMS 4.9 and earlier are not compatible with PHPUnit 9.

If the `"require"` block in composer.json does not have a requirement for `"silverstripe/framework"`, you can put the requirement in `"require-dev"` so that it's only required when running CI or running unit tests locally. This will allow older versions of Silverstripe CMS to use the latest version of your module.

## Common changes to make to your unit-test suites

These are some common adjustments that need to be made to unit tests so they're compatible with the PHPUnit 9.5 API:

- `setUp()` and `tearDown()` now require the `:void` return type e.g. `setUp(): void`
- `assertContains()` and `assertNotContains()` no longer accept strings so update to  `assertStringContainsString()` and `assertStringNotContainsString()`
- `assertInternalType('%Type%')` needs to be changed to `assertIs%Type%()` e.g. `assertIsInt()` - [full list](https://github.com/sebastianbergmann/PHPUnit/issues/3368)
- `@expectedException` style annotations are changed to [php functions](https://phpunit.readthedocs.io/en/9.5/writing-tests-for-phpunit.html#testing-exceptions)
- Wrapping &lt;testsuite&gt; elements with a &lt;testsuites&gt; element in phpunit.xml / phpunit.xml.dist

You see the full list of PHPUnit changes in the [announcements](https://PHPUnit.de/announcements/) section of the PHPUnit.de website.
