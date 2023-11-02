---
title: Definition of Public API
summary: A definition of what we consider to be "public API" which is protected by semantic versioning
icon: code
---

# Definition of public API

The following is a definition of what we consider to be "public API". Public API is protected by semantic versioning.

New public API will not be introduced in patches, but can be introduced in minor and major releases.

Existing public API will not be removed or altered in patches or minor releases, but can be removed or altered in major releases.

## Explicitly included

These are explicitly included in our definition of public API (unless excluded below):

- **global** functions, constants, and variables
- namespaces, classes, interfaces, enums, and traits
- public and protected scope (including methods, properties and constants)
- signatures of functions/methods that are considered public API
  - including typehints, parameters, and parameter names
- private static class property declarations (considered to be configuration variables)
- configuration default values (in YAML files and in private statics)
- YAML configuration file and fragment names (see [yml configuration syntax](/developer_guides/configuration/configuration/#syntax))
- extension hooks (e.g. `$this->extend('someExtensionHook', $someVariable);`)

## Explicitly excluded

These are explicitly *not* public API:

- private scope (with the exception for `private static` properties which aren't annotated with `@internal`)
- all entities marked as `@internal`
- YAML configuration in recipes
- HTML, CSS, JavaScript (within reason), SQL, and anything else that is not PHP

## Implicit or undefined scenarios

Other entities might be considered to be included or excluded from the public API on case-by-case basis based on how likely it is to cause problems during an upgrade.

API from third party dependencies may implicitly be incorporated into our definition of public API if:

- they are defined as a parameter type for a supported method
- they are defined as a return type for a supported method
- they are extended by a Silverstripe CMS class.

When defining a return type or a parameter type, it is preferable to use a more generic interface rather than a specific class. Third party dependencies that are used for internal purposes and are not explicitly exposed via the Silverstripe CMS public API are not covered by semantic versioning and maybe substituted without notice.
