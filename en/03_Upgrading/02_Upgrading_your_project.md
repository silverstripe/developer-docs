---
title: Upgrading to Silverstripe CMS 5
summary: Upgrade your project to Silverstripe CMS 5.
---

# Upgrading a Silverstripe CMS 4 project to Silverstripe CMS 5

## Breaking changes (by module, alphabetically)

### silverstripe/framework

- Removed deprecated `ManifestFileFinder::RESOURCES_DIR`
- Changed the default for the `RESOURCES_DIR` const to "_resources"
  - This can still be customised using `extra.resources-dir` in your composer.json file ([see relevant docs](developer_guides/templates/requirements/#configuring-your-project-exposed-folders))
  - If your composer.json file has its `extra.resources-dir` key set to `_resources`, you can remove that now.
  - If your composer.json file already does not have an `extra.resources-dir` key and you want to keep your resources in the `resources` directory, you can set `extra.resources-dir` to "resources".
  - If your composer.json file already does not have an `extra.resources-dir` key and you want to use the new default `_resources` directory, you may need to check that your code and templates don't assume the directory name for those resources. In your templates it is preferred to [use `$resourePath()` or `$resourceURL()`](developer_guides/templates/requirements/#direct-resource-urls) to get paths for resources.
- Removed various API related to support for PHPUnit 5.7
  - Removed deprecated method `SilverStripe\Core\BaseKernel::getIgnoredCIConfigs()`
  - Removed deprecated method `SilverStripe\Core\Manifest\Module::getCIConfig()`
  - Removed deprecated method `SilverStripe\Dev\TestKernel::getIgnoredCIConfigs()`
  - Removed deprecated method `SilverStripe\Dev\TestKernel::setIgnoredCIConfigs()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\Core\Manifest\ClassLoader::init()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\Core\Manifest\ClassManifest::init()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\Core\Manifest\ClassManifest::regenerate()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\Core\Manifest\ModuleLoader::init()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\Core\Manifest\ModuleManifest::init()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\Core\Manifest\ModuleManifest::regenerate()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\View\ThemeManifest::init()`
  - Removed deprecated parameter `$ignoredCIConfigs` from `SilverStripe\View\ThemeManifest::regenerate()`
  - Removed deprecated PHPUnit 5.7 version of the class `SilverStripe\Dev\Constraint\SSListContains`
    - The PHPUnit 9 compatible version of this class remains.
  - Removed deprecated PHPUnit 5.7 version of the class `SilverStripe\Dev\Constraint\SSListContainsOnlyMatchingItems`
    - The PHPUnit 9 compatible version of this class remains.
  - Removed deprecated PHPUnit 5.7 version of the class `SilverStripe\Dev\Constraint\ViewableDataContains`
    - The PHPUnit 9 compatible version of this class remains.
  - Removed deprecated PHPUnit 5.7 version of the class `SilverStripe\Dev\FunctionalTest`
    - The PHPUnit 9 compatible version of this class remains.
  - Removed deprecated PHPUnit 5.7 version of the class `SilverStripe\Dev\SapphireTest`
    - The PHPUnit 9 compatible version of this class remains.

### silverstripe/vendor-plugin

- Removed deprecated `Library::RESOURCES_DIR`
- Changed `Library::DEFAULT_RESOURCES_DIR` to "_resources"
