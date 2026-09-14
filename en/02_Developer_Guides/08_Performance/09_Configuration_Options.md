---
title: Configuration Options
summary: Configuration options for improving performance
---

# Configuration options

There are multiple configuration options across Silverstripe CMS that can help to improve your performance, particularly for projects with large datasets.

Some relevant configuration properties are specifically outlined in the [ORM Performance](./orm/) section or in documentation for specific modules and won't be repeated below.

Note that this is not an exhaustive list of configuration options that could improve performance, but we think these are worth explicitly calling out.

## Disable dynamic archive page message

When you archive a page, the message that is displayed in the dialog box is dynamically generated based on whether the page has any descendants among other things. For pages with many descendants, this can be slow.

The dynamic functionality can be disabled by setting [`CMSMain.enable_dynamic_archive_warning_message`](api:SilverStripe\CMS\Controllers\CMSMain->enable_dynamic_archive_warning_message) to `false`, falling back to a hardcoded message instead.

```yml
SilverStripe\CMS\Controllers\CMSMain:
  enable_dynamic_archive_warning_message: false
```

## `Hierarchy` node thresholds

For the site tree in the `/admin/pages` section as well as in `TreeDropdownField`, the number of records that will be loaded initially relies on two configuration properties:

- [`Hierarchy.node_threshold_total`](api:SilverStripe\ORM\Hierarchy\Hierarchy->node_threshold_total): The lower bound of nodes to load. Note that all root nodes will always be loaded - this configuration used to determine whether to also load child nodes.
- [`Hierarchy.node_threshold_leaf`](api:SilverStripe\ORM\Hierarchy\Hierarchy->node_threshold_leaf): Maxiumum number of child nodes to load. Usually if a node has more children than this limit, its children won't be loaded.

If you find that loading the site tree is a bottleneck, you may find setting these values lower can help. Note that they need to be set on the relevant class, not `Hierarchy` itself. For the site tree that's [`SiteTree`](api:SilverStripe\CMS\Model\SiteTree). For `TreeDropdownField` set [TreeDropdownField.node_threshold_total](api:SilverStripe\Forms\TreeDropdownField->node_threshold_total) instead. There is no corresponding configuration to `node_threshold_leaf` for `TreeDropdownField`.

## Dropdown field threshold

When scaffolding form fields for a `has_one` relation, and for `many_many` or `has_many` relations containing [`Member`](api:SilverStripe\Security\Member) records, the [`DBForeignKey.dropdown_field_threshold`](api:SilverStripe\ORM\FieldType\DBForeignKey->dropdown_field_threshold) configuration property determines whether to lazy-load records and how many records to display per search request.

For models with extremely large datasets (in the many hundreds of thousands or more) even a count query can become slow. In those cases, you may want to skip the count query and tell the field to always lazy-load. You can do that by setting `DBForeignKey.dropdown_field_threshold` to `0`.

```yml
SilverStripe\ORM\FieldType\DBForeignKey:
  dropdown_field_threshold: 0
```

## Previous and next in `GridFieldDetailForm`

The `Previous` and `Next` actions on the edit form inside a [`GridField`](api:SilverStripe\Forms\GridField\GridField) are visible by default. These require getting finding this record's location in the pagination and fetching its previous and next records.

For models with extremely large datasets (in the many hundreds of thousands or more), pagination queries can become slow. For those cases you may want to disable these actions.

This can be done globally with the [`GridFieldDetailForm_ItemRequest.formActions`](api:SilverStripe\Forms\GridField\GridFieldDetailForm_ItemRequest->formActions) YAML configuration:

```yml
SilverStripe\Forms\GridField\GridFieldDetailForm_ItemRequest:
  formActions:
    showPagination: false
```

It can also be done per `GridField`:

```php
use SilverStripe\Forms\GridField\GridFieldDetailForm;
$gridfield->getConfig()->getComponentByType(GridFieldDetailForm::class)->setShowPagination(false);
```

## Allow empty folders

If you have many thousands of files in a folder, and especially if you're using a service like AWS S3 instead of the filesystem to manage assets, checking if a folder is empty in order to delete it can be slow.

If you find that's a bottleneck for you, you can allow empty folders to remain by setting the [`FlysystemAssetStore.keep_empty_dirs`](api:SilverStripe\Assets\Flysystem\FlysystemAssetStore->keep_empty_dirs) YAML configuration to `true`.

```yml
SilverStripe\Assets\Flysystem\FlysystemAssetStore:
  keep_empty_dirs: true
```
