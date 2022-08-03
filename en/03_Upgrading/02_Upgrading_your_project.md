---
title: Upgrading to Silverstripe CMS 5
summary: Upgrade your project to Silverstripe CMS 5.
---

# Upgrading a Silverstripe CMS 4 project to Silverstripe CMS 5

## Breaking changes (by module, alphabetically)

### silverstripe/framework

- Removed the ability to configure the `_resources` directory path
  - Removed `Module::getResourcesDir()`
  - Removed `ManifestFileFinder::RESOURCES_DIR`

### silverstripe/vendor-plugin

- Removed the ability to configure the `_resources` directory path
  - Removed `Library::DEFAULT_RESOURCES_DIR`
  - Set `Library::RESOURCES_PATH` to explicitly be "_resources"
  - Removed `Library::getResourcesDir()`
