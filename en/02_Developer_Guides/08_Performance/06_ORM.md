---
title: ORM Performance
summary: Configuration and tips for improving ORM performance
---

# ORM performance

## Identifying ORM performance bottlenecks

ORM performance issues can arise from various factors, including:

- Inefficient database queries
- Lack of proper indexes
- Large datasets
- Complex relationships

You can use the [`showqueries` variable tool](/developer_guides/debugging/url_variable_tools/#database) on a dev environment to identify slow running database queries.

## Indexes

Adding indexes to frequently queried fields can significantly improve performance. You can define indexes for your ORM queries using the `$indexes` configuration property in your `DataObject` subclasses. See the [Indexes](/developer_guides/model/indexes) section for more information.

### `TreeDropdownField` `SearchFilter` configuration {#treedropdownfield}

The [`TreeDropdownField`](api:SilverStripe\Forms\TreeDropdownField) uses a [`PartialMatchFilter`](api:SilverStripe\ORM\Filters\PartialMatchFilter) by default to match against records. Indexes aren't effective when this filter is used, so you may find this field is slow with large datasets.

You can configure the field to use a different filter (such as [`StartsWithFilter`](api:SilverStripe\ORM\Filters\StartsWithFilter)) using the `TreeDropdownField.search_filter` configuration property:

```yml
SilverStripe\Forms\TreeDropdownField:
  search_filter: 'StartsWith'
```

> [!TIP]
> A common use of `TreeDropdownField` is the "Insert Link" feature used by supported HTML editors. Setting this configuration to use another filter and adding an index on `Title` and `MenuTitle` for [`SiteTree`](api:SilverStripe\CMS\Model\SiteTree) can significantly improve performance.

See [SearchFilter Modifiers](/developer_guides/model/searchfilters/) for more information about search filters.

### `searchable_fields` general search field

Search functionality in the CMS by default allows you to search across *all* fields in your `searchable_fields` configuration with the main search field. If you don't have a composite index that covers all of these and you have a large dataset - especially if some of the fields are on relation tables - you might find this to be slow.

You can disable that functionality by setting the [`general_search_field_name`](api:SilverStripe\ORM\DataObject->general_search_field_name) configuration property to any empty string for large models.

See [customise the general search field name](/developer_guides/model/scaffolding/#customise-the-general-search-field-name) for more details about this configuration.

## Speeding up database builds

### Skipping check and repair when the database is built {#skip-check-and-repair}

When you run `sake db:build`, there is a step that checks the integrity of the database tables (via `CHECK TABLE`) and repairs issues (via `REPAIR TABLE`) if possible.

For tables with many records (tens/hundreds of thousands) this can be slow. If you identify that you have some specific `DataObject` models with lots of records
which are slowing down building the database, you might want to explicitly skip checks for those:

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

> [!WARNING]
> Excluding models from database checks can lead to undetected data corruption or other issues. Only exclude models if you are certain of what you are doing.

You can always manually trigger a check and repair (e.g. in a [`BuildTask`](api:SilverStripe/Dev/BuildTask)) by calling [`DB::check_and_repair_table()`](api:SilverStripe\ORM\DB::check_and_repair_table()). This ignores the above configuration.

### Skipping record counts

When you run `sake db:build`, by default the ORM will output how many records are in each table.

For models with extremely large datasets (in the many hundreds of thousands or more) even a count query can become slow. In those cases you may want to disable this count.

```yml
SilverStripe\Dev\Command\DbBuild:
  show_record_counts: false
```

### Changing `ClassName` column from enum to varchar {#classname-varchar}

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

### Skip legacy `UserForm` upgrade steps

For legacy reasons, when you run `sake db:build` and you have `silverstripe/userforms` installed, your user forms will be iterated over to check they have a valid [`UserForm`](api:SilverStripe\UserForms\UserForm) parent.

If you have lots of user forms (especially complex ones), this can slow down the build process. You can disable this check with the [`UserDefinedForm.upgrade_on_build`](api:SilverStripe\UserForms\Model\UserDefinedForm->upgrade_on_build) YAML configuration:

```yml
SilverStripe\UserForms\Model\UserDefinedForm:
  upgrade_on_build: false
```

## Conditions vs joins for `Versioned`

By default, the [`Versioned`](api:SilverStripe\Versioned\Versioned) extension uses a lot of joins. Many of these can be swapped out for `WHERE` conditional statements instead.

Performance of the join scales on the size of versions tables where as the `WHERE` condition scales on the number of records being returned from the base query.

If you find you have a lot of historical version data but not a lot of active records, you might want to swap to using `WHERE` conditional statements. That can be done by setting [`Versioned.use_conditions_over_inner_joins`](api:SilverStripe\Versioned\Versioned->use_conditions_over_inner_joins) to `true`.

```yml
SilverStripe\Versioned\Versioned:
  use_conditions_over_inner_joins: true
```

## Making raw SQL queries {#raw-sql}

If find the ORM is making needlessly inefficient SQL queries for a particular use case, then you can use raw SQL.

> [!WARNING]
> Using raw SQL queries can make your code less more difficult to maintain. Only use raw SQL when the ORM is a clear bottleneck. Consider carefully if this approach is needed.

Refer to the [raw SQL](/developer_guides/model/data_model_and_orm/#raw-sql) section for details about how to make raw SQL queries.
