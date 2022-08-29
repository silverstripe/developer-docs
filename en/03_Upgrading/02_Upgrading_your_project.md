---
title: Upgrading to Silverstripe CMS 5
summary: Upgrade your project to Silverstripe CMS 5.
---

# Upgrading a Silverstripe CMS 4 project to Silverstripe CMS 5

## Breaking changes (by module, alphabetically)

### dnadesign/silverstripe-elemental

- Removed deprecated class `DNADesign\Elemental\Search\ElementalSolrIndex`.

### silverstripe/cms

- Removed deprecated class `SilverStripe\CMS\Controllers\CMSPageHistoryController` and the javascript associated with it.

### silverstripe/framework

- Removed deprecated constant `ManifestFileFinder::RESOURCES_DIR`
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
- Removed various API in ORM related to `Iterator`
  - Removed `current()`, `key()`, `next()`, `nextRecord()`, `rewind()`, `seek()`, and `valid()` from the following classes:
    - `SilverStripe\ORM\Connect\MySQLQuery`
    - `SilverStripe\ORM\Connect\MySQLStatement`
    - `SilverStripe\ORM\Connect\PDOQuery`
    - `SilverStripe\ORM\Connect\Query`
  - Removed `SilverStripe\ORM\DataList::getGenerator()` (use `getIterator()` instead)
  - Removed the `SilverStripe\ORM\Map_Iterator` class. `SilverStripe\ORM\Map` now uses a generator instead.
- Removed deprecated method `SilverStripe\Core\BaseKernel::sessionEnvironment()`
- Removed deprecated method `SilverStripe\Core\Extensible::constructExtensions()`
- `SilverStripe\Core\Extensible::invokeWithExtensions()` and `SilverStripe\Core\Extensible::extend()` now use the splat operator instead of having a concrete number of possible arguments.
- `SilverStripe\Dev\FunctionalTest` is now abstract.
- `SilverStripe\Dev\MigrationTask` is now abstract.
- `SilverStripe\Dev\SapphireTest` is now abstract.

### silverstripe/vendor-plugin

- Removed deprecated `Library::RESOURCES_DIR`
- Changed `Library::DEFAULT_RESOURCES_DIR` to "_resources"

### silverstripe/versioned

- The constructor for `SilverStripe\Versioned\Versioned` now explicitly only accepts mode as a single argument.
- Removed deprecated method `SilverStripe\Versioned\Versioned::doPublish()`
- Removed deprecated method `SilverStripe\Versioned\Versioned::doRollbackTo()`
- Removed deprecated method `SilverStripe\Versioned\Versioned::migrateVersion()`
- Removed deprecated method `SilverStripe\Versioned\Versioned::onAfterRevertToLive()`
- Removed deprecated method `SilverStripe\Versioned\Versioned::onAfterRollback()`
- Removed deprecated method `SilverStripe\Versioned\Versioned::publish()`

### silverstripe/versioned-admin

- Removed deprecated class `SilverStripe\VersionedAdmin\Controllers\HistoryControllerFactory`
