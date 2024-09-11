---
title: ORM Performance
summary: Configuration and tips for improving ORM performance
---

# ORM performance

## Indexes

You can define indexes for your ORM queries using the `$indexes` configuration property in your `DataObject` subclasses. See the [Indexes](/developer_guides/model/indexes) section for more information.

### `TreeDropdownField` `SearchFilter` configuration {#treedropdownfield}

The [`TreeDropdownField`](api:SilverStripe\Forms\TreeDropdownField) uses a [`PartialMatchFilter`](api:SilverStripe\ORM\Filters\PartialMatchFilter) by default to match against records. Indexes aren't effective when this filter is used, so you may find this field is slow with large datasets.

You can configure the field to use a different filter (such as [`StartsWithFilter`](api:SilverStripe\ORM\Filters\StartsWithFilter)) using the `TreeDropdownField.search_filter` configuration property:

```yml
SilverStripe\Forms\TreeDropdownField:
  search_filter: 'StartsWith'
```

> [!TIP]
> A very common use of `TreeDropdownField` is the "Insert Link" feature in the TinyMCE WYSIWYG. Setting this configuration to use another filter and adding an index on `Title` and `MenuTitle` for [`SiteTree`](api:SilverStripe\CMS\Model\SiteTree) can significantly improve performance.

See [SearchFilter Modifiers](/developer_guides/model/searchfilters/) for more information about search filters.

## Skipping check and repair during dev/build {#skip-check-and-repair}

When you run `dev/build`, there is a step that checks the integrity of the database tables (via `CHECK TABLE`) and repairs issues (via `REPAIR TABLE`) if possible.

For tables with many records (tens/hundreds of thousands) this can be slow. If you identify that you have some specific `DataObject` models with lots of records
which are slowing down your `dev/build`, you might want to explicitly skip checks for those:

```yml
SilverStripe\ORM\Connect\DBSchemaManager:
  exclude_models_from_db_checks:
    - App\Model\ModelWithManyRecords
```

> [!NOTE]
> Note: The entire inheritance chain (both ancestors and descendents) of models in that configuration array will be excluded from the check and repair step.

You can also disable these checks entirely:

```yml
SilverStripe\ORM\Connect\DBSchemaManager:
  check_and_repair_on_build: false
```

You can always manually trigger a check and repair (e.g. in a [`BuildTask`](api:SilverStripe/Dev/BuildTask)) by calling [`DB::check_and_repair_table()`](api:SilverStripe\ORM\DB::check_and_repair_table()). This ignores the above configuration.

## Changing `ClassName` column from enum to varchar {#classname-varchar}

On websites with very large database tables it can take a long time to run `dev/build`, which can be a problem when deploying changes to production. This is because the `ClassName` column is an `enum` type which requires an a `ALTER TABLE` query to be run affecting every row whenever there is a new valid value for the column.

For a very rough benchmark, running an `ALTER TABLE` query on a database table of 10 million records took 28.52 seconds on a mid-range 2023 laptop, though this time will vary depending on the database and hardware being used.

You may wish to change the `ClassName` column to a `varchar` type which remove the need to run `ALTER TABLE` whenever there is a new valid value. Enabling this will result in a trade-off where the size of the database will increase by approximately 7 MB per 100,000 rows.

> [!WARNING]
> There will also be a very slow initial `dev/build` as all of the `ClassName` columns are switched to `varchar`.

To enable this, add the following configuration:

```yml
SilverStripe\ORM\DataObject:
  fixed_fields:
    ClassName: DBClassNameVarchar

SilverStripe\ORM\FieldType\DBPolymorphicForeignKey:
  composite_db:
    Class: "DBClassNameVarchar('SilverStripe\\ORM\\DataObject', ['index' => false])"
```
