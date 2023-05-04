---
title: Generating Unique Keys
summary: Outputting unique keys in templates.
icon: code
---

# Unique Keys

There are several cases where you may want to generate a unique key. For example:

* populate `ID` attribute in your HTML output
* key for partial cache

If this is for a public-facing purpose, it is typically considered bad practice to expose the database ID,
as this provides unnecessary information to would-be attackers. Instead, for [`DataObject`](api:SilverStripe\ORM\DataObject) subclasses, you
can use the [`getUniqueKey()`](api:SilverStripe\ORM\DataObject::getUniqueKey()) method.

This can be done simply by including following code in your template:

```ss
$UniqueKey
```

## Customisation

The unique key generation can be altered in two ways:

1. you can provide extra data to be used when generating a key via an extension
2. you can inject over the key generation service and write your own custom code.

### Extension point

The `cacheKeyComponent` extension hook is invoked from `DataObject::getUniqueKeyComponents()`.
Simply implement a `cacheKeyComponent()` method in an [`Extension`](api:SilverStripe\Core\Extension) applied to the `DataObject` class you want to affect.
The method must return a string, which will be used when generating a unique key for the record.

Some cases where this is used in supported modules already are:

* versions - an object in different version stages needs to have different unique keys for each stage
* locales - an object in different locales needs to have different unique keys for each locale

See [Extensions and DataExtensions](/developer_guides/extending/extensions) for more information about implementing and applying extensions.

### Custom service

[`UniqueKeyService`](api:SilverStripe\ORM\UniqueKey\UniqueKeyService) is used by default but you can use injector to override it with your custom service. For example:

```yaml
SilverStripe\Core\Injector\Injector:
  SilverStripe\ORM\UniqueKey\UniqueKeyService:
    class: App\Service\MyCustomService
```

Your custom service has to implement `UniqueKeyInterface`.

A use case for implementing your own service might be to produce a UUID for each record.
