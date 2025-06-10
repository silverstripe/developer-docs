---
title: Indexes
summary: Add Indexes to your Data Model to optimize database queries.
icon: database
---

# Indexes

Indexes are a great way to improve performance in your application, especially as it grows. By adding indexes to your
data model you can reduce the time taken for the framework to find and filter data objects.

The addition of an indexes should be carefully evaluated as they can also increase the cost of other operations such as
`UPDATE`/`INSERT` and `DELETE`. An index on a column whose data is non unique will actually cost you performance.
For example, in most cases an index on `boolean` status flag, or `ENUM` state will not increase query performance.

It's important to find the right balance to achieve fast queries using the optimal set of indexes; For Silverstripe CMS
applications it's a good practice to:

- add indexes on columns which are frequently used in `filter`, `where` or `orderBy` statements
- for these, only include indexes for columns which are the most restrictive (return the least number of rows)

The Silverstripe CMS framework already places certain indexes for you by default:

- The primary key for each model has a `PRIMARY KEY` unique index
- The `ClassName` column if your model inherits from `DataObject`
- All relationships defined in the model have indexes for their `has_one` entity (for `many_many` relationships
this index is present on the associative entity).
- All fields used in `default_sort` configuration (see [`default_sort` index mode](#default-sort-index-mode) below for additional options)
- Some built-in models (such as [`Member`](api:SilverStripe\Security\Member)) have specific indexes added

## Defining an index

Indexes are represented on a `DataObject` through the [`DataObject.indexes`](api:SilverStripe\ORM\DataObject->indexes) configuration property which maps index names to a
descriptor. There are several supported notations:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyObject extends DataObject
{
    private static array $indexes = [
        '<column-name>' => true,
        '<index-name>' => [
            'type' => '<type>',
            'columns' => ['<column-name>', '<other-column-name>'],
        ],
        '<index-name>' => ['<column-name>', '<other-column-name>'],
    ];
}
```

The `<column-name>` is used to put a standard non-unique index on the column specified. For complex or large tables
we recommend building the index to suite the requirements of your data.

The `<index-name>` can be an arbitrary identifier in order to allow for more than one index on a specific database
column. The "advanced" notation supports more `<type>` notations. These vary between database drivers, but all of them
support the following:

- `index`: Standard non unique index.
- `unique`: Index plus uniqueness constraint on the value
- `fulltext`: Fulltext content index

> [!NOTE]
> Violating a unique index will throw a [`DuplicateEntryException`](api:SilverStripe\ORM\Connect\DuplicateEntryException) exception which you can catch and handle to produce appropriate validation messages.
>
> If the violation happens when calling [`DataObject::write()`](api:SilverStripe\ORM\DataObject::write()), the exception will be caught and a [`ValidationException`](api:SilverStripe\Core\Validation\ValidationException) will be thrown instead. The CMS catches any `ValidationException` and displays them as user friendly validation errors in edit forms.

```php
// app/src/MyTestObject.php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyTestObject extends DataObject
{
    private static array $db = [
        'MyField' => 'Varchar',
        'MyOtherField' => 'Varchar',
    ];

    private static array $indexes = [
        'MyIndexName' => ['MyField', 'MyOtherField'],
    ];
}
```

### Complex/Composite indexes

For complex queries it may be necessary to define a complex or composite index on the supporting object. To create a
composite index, define the fields in the index order as a comma separated list.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyTestObject extends DataObject
{
    // ...
    private static array $indexes = [
        'MyCompositeIndex' => ['MyField', 'MyOtherField', 'MyThirdField'],
    ];
}
```

Composite indexes can be used for any query that uses the fields in this specific order, include queries that omit columns from later in the index. For example, the index would be used for these queries:

- `WHERE MyField = ?`
- `WHERE (MyField = ? AND MyOtherField = ?)`
- `WHERE (MyField = ? AND MyOtherField = ? AND MyThirdField = ?)`

The index would not be used for a query `WHERE MyOtherField = ?` (because the first column is not used in this query) or for `WHERE MyField = ? OR MyOtherField = ?` (because the database has to check all rows to see if the `MyOtherField` column matches on its own).

As an alternative to a composite index, you can also create a hashed column which is a combination of information from
other columns. If this is indexed, smaller and reasonably unique it might be faster that an index on the whole column.

### Directionality

You can choose to define the direction for each column in the index. This can be useful if you know you usually sort a model in a specific direction. It's crucial for composite indexes if you are sorting on one column in a different direction than the others.

The direction is defined by adding either `ASC` or `DESC` after the column name. `ASC` is implied if no direction is specified.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyTestObject extends DataObject
{
    // ...
    private static array $indexes = [
        'MyCompositeIndex' => ['MyField ASC', 'MyOtherField DESC'],
    ];
}
```

### `default_sort` index mode {#default-sort-index-mode}

By default, if the [`default_sort`](api:SilverStripe\ORM\DataObject->default_sort) configuration for your `DataObject` subclass specifies multiple columns, the ORM will create an index for each column as well as a composite index that includes all of the columns in your sort order. The composite index is always called `default_sort_composite`.

You can change what indexes will be created by setting the [`default_sort_index_mode`](api:SilverStripe\ORM\DataObject->default_sort_index_mode) configuration for your class. It takes the following options:

|Constant|Value|What it does|
|---|---|---|
|[`DataObjectSchema::SORT_INDEX_MODE_NONE`](api:SilverStripe\ORM\DataObjectSchema::SORT_INDEX_MODE_NONE)|none|Do not create any indexes for `default_sort`. Implies you will define your own indexes.|
|[`DataObjectSchema::SORT_INDEX_MODE_SINGLE`](api:SilverStripe\ORM\DataObjectSchema::SORT_INDEX_MODE_SINGLE)|single|Do not create a composite index, only create an index for each column.|
|[`DataObjectSchema::SORT_INDEX_MODE_COMPOSITE`](api:SilverStripe\ORM\DataObjectSchema::SORT_INDEX_MODE_COMPOSITE)|composite|Create only a composite index, not an index for each column.|
|[`DataObjectSchema::SORT_INDEX_MODE_BOTH`](api:SilverStripe\ORM\DataObjectSchema::SORT_INDEX_MODE_BOTH)|both|Create both a composite index and an index for each column (this is the default).|

> [!WARNING]
> Note that the ORM cannot create composite indexes that include columns in a different table (e.g. from a parent class or a relation).

If you have the following classes:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyTestObject extends DataObject
{
    private static array $db = [
        'MyField' => 'Varchar',
        'MyOtherField' => 'Varchar',
    ];

    private static array $default_sort = 'ID';
}
```

```php
namespace App\Model;

class MySubclass extends MyTestObject
{
    private static array $db = [
        'MyThirdField' => 'Varchar',
    ];

    private static array $default_sort = 'MyField, MyOtherField, MyThirdField';
}
```

The ORM will not create a composite index for either class. It doesn't create one for `MyTestObject` because its `default_sort` definition only includes one column, and it doesn't create one for `MySubclass` because the first two columns it references belong on the superclass table, not the subclass table.

> [!NOTE]
> If you set `default_sort_index_mode` to "Composite" but your `default_sort` configuration only contains a single column, a `default_sort_composite` index will be created, though it will only contain that single column.

In these situations you may want to create your own composite index - for this example it would be an index with the first two columns in the `MyTestObject` table, as it is likely this index would be used when sorting `MySubclass` records.

Note that `ID` as a column at the *end* of your sort order won't be included in any composite indexes, because the database already implicitly adds that to all indexes.

## Index creation/destruction

Indexes are generated and removed automatically when building the database based on your configuration. Caution if you're working with large tables and
modify an index as the next time the database is built it will `DROP` the index, and then `ADD` it.

Note that the ORM won't automatically drop indexes if you remove them from the `indexes` configuration array or update your `default_sort` configuration. Instead, you need to set the value to `false` like so:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyTestObject extends DataObject
{
    // ...
    private static $indexes = [
        'MyIndexName' => false,
    ];
}
```

Setting an index to `false` tells the ORM to not generate it (e.g. for automatically generated indexes for relation joins) and to drop it if it already exists.

## API documentation

- [DataObject](api:SilverStripe\ORM\DataObject)
