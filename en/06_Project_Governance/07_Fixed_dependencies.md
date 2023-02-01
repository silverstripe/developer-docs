---
title: Fixed depnedencies
---

# Silverstripe CMS 5 fixed dependencies

Silverstripe CMS relies on third party packages. Silverstripe CMS projects may interact directly or indirectly with those dependencies.

We defined a list of "fixed dependencies" for the lifetime of Silverstripe CMS 5. Those dependencies will not be upgraded to new major version within the Silverstripe CMS 5 release line.

Dependencies not in this list, may be changed or removed altogether within the lifetime of Silverstripe CMS 5.

Dependency | Version
-- | --
composer-plugin-api | 2
[composer/installers](https://packagist.org/packages/composer/installers) | 2
[guzzlehttp/guzzle](https://packagist.org/packages/guzzlehttp/guzzle) | 7
[guzzlehttp/psr7](https://packagist.org/packages/guzzlehttp/psr7) | 2
[intervention/image](https://packagist.org/packages/intervention/image) | 2
[league/flysystem](https://packagist.org/packages/league/flysystem) | 3
[monolog/monolog](https://packagist.org/packages/monolog/monolog) | 3
[phpunit/phpunit](https://packagist.org/packages/phpunit/phpunit) | 9
[symfony/*](https://packagist.org/packages/symfony/) | 6
[webonyx/graphql-php](https://packagist.org/packages/webonyx/graphql-php) | 15

## Symfony dependencies

Silverstripe CMS relies on many Symfony packages. Silverstripe CMS 5 tracks the Symfony 6 release. If your Silverstripe CMS project uses Symfony packages, install packages version compatible with Symfony 6 or you may encounter dependency conflicts.

## Related information

- [Dependency management](./Major_release_policy#Dependency-management) as defined by our Major release policy
- [Symfony support commitments](./Major_release_policy#Symfony-support-commitments) as defined by our Major release policy