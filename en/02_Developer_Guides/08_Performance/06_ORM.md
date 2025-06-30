---
title: ORM Performance
summary: Configuration and tips for improving ORM performance
---

# ORM performance

## Caching database queries

Database queries made using [`DataList`](api:SilverStripe\ORM\DataList) or [`SQLSelect`](api:SilverStripe\ORM\Queries\SQLSelect) can be cached. The cached query result lasts until the end of the request, unless invalidated during that request.

This is useful if you make the same query multiple times in the same request.

> [!WARNING]
> Caching always comes with an increase in memory usage. Make sure you are aware of the trade offs, and only cache queries which are repeated multiple times in the same request, and are not already cached in other ways.

To enable caching on a `DataList`, call the [`DataList::setUseCache`](api:SilverStripe\ORM\DataList::setUseCache()) method.

```php
use App\Model\MyDataObject;

$cachedList = MyDataObject::get()->setUseCache(true);
```

To enable caching on a `SQLSelect`, call the [`SQLSelect::setUseCache`](api:SilverStripe\ORM\Queries\SQLSelect) method.

```php
use SilverStripe\ORM\Queries\SQLSelect;

$cachedQuery = SQLSelect::create(/*...*/)->setUseCache(true, 'some-namespace');
```

This is very similar to caching on a `DataList`, except that, because `SQLSelect` doesn't have a specific `DataObject` class it pertains to, you can pass a namespace into the `SQLSelect::setUseCache()` method. This allows you to invalidate the cache for that query and any other queries in the same namespace without affecting any other cached queries.

> [!HINT]
> When using `SQLSelect` to get data for a specific `DataObject` class, it is good practice to set the namespace for `SQLSelect` cache to be the FQCN of that `DataObject` class.
> That allows the ORM to invalidate the cache in the same scenarios that similar cache from a `DataList` would be invalidated.

`DataList` caching implicitly uses `SQLSelect` caching under the hood, with the namespace for the cache being the FQCN of the `DataObject` class that list pertains to.

Note that all database queries for a cached `DataList` or `SQLSelect` will be cached. This includes aggregate queries (e.g. `max()` or `avg()`), calling `count()`, paginated queries, etc. The cache key is derived from the SQL of the query that will be sent to the database, so each of these will safely cache their own result separately.

### Invalidating query cache

Queries cached through `DataList` or `SQLSelect` are automatically invalidated in the following scenarios:

- One of the following methods is called on a record of that class or one of its subclasses:
  - [`write()`](api:SilverStripe\ORM\DataObject::write())
  - [`delete()`](api:SilverStripe\ORM\DataObject::delete())
  - [`destroy()`](api:SilverStripe\ORM\DataObject::destroy())
  - [`flushCache()`](api:SilverStripe\ORM\DataObject::flushCache())
- One of the following methods is called on a `DataList` that manages that class or one of its subclasses:
  - [`add()`](api:SilverStripe\ORM\DataList::add())
  - [`remove()`](api:SilverStripe\ORM\DataList::remove())
- One of the following static methods is called:
  - [`DataObject::reset()`](api:SilverStripe\ORM\DataObject::reset())
  - [`DataObject::flush_and_destroy_cache()`](api:SilverStripe\ORM\DataObject::flush_and_destroy_cache())
  - [`DataList::reset()`](api:SilverStripe\ORM\DataList::reset())
  - [`DataList::resetAndDestroyCache()`](api:SilverStripe\ORM\DataList::resetAndDestroyCache())

Queries cached explicitly through `SQLSelect` (i.e. no `DataList` was involved at all) can be invalidated by calling [`SQLSelect::reset()`](api:SilverStripe\ORM\Queries\SQLSelect::reset()).

> [!TIP]
> You can pass in a class name when calling [`DataObject::reset()`](api:SilverStripe\ORM\DataObject::reset()) or a cache namespace when calling [`SQLSelect::reset()`](api:SilverStripe\ORM\Queries\SQLSelect::reset()) to only invalidate the cache relevant to that class or namespace.

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

## Skipping check and repair when the database is built {#skip-check-and-repair}

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

## Making raw SQL queries {#raw-sql}

If find the ORM is making needlessly inefficient SQL queries for a particular use case, then you can use raw SQL.

> [!WARNING]
> Using raw SQL queries can make your code less more difficult to maintain. Only use raw SQL when the ORM is a clear bottleneck. Consider carefully if this approach is needed.

Refer to the [raw SQL](/developer_guides/model/data_model_and_orm/#raw-sql) section for details about how to make raw SQL queries.
