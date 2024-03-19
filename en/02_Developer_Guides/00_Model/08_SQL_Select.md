---
title: SQL Queries
summary: Write and modify direct database queries through SQLExpression subclasses.
iconBrand: searchengin
---

# SQL queries

Most of the time you will be using the ORM abstraction layer to interact with the database
(see [Introduction to the Data Model and ORM](/developer_guides/model/data_model_and_orm)),
but sometimes you may need to do something very complex or specific which is hard to do with
that abstraction.

Silverstripe CMS provides a lower level abstraction layer, which is used by the Silverstripe CMS ORM internally.

Dealing with low-level SQL is not encouraged, since the ORM provides
powerful abstraction APIs.
Records in collections are lazy loaded,
and these collections have the ability to run efficient SQL
such as counts or returning a single column.

For example, if you want to run a simple `COUNT` SQL statement,
the following three statements are functionally equivalent:

```php
use SilverStripe\ORM\DB;
use SilverStripe\ORM\Queries\SQLSelect;
use SilverStripe\Security\Member;

// Get the table for the "Member" class with ANSI quotes
$memberTable = DB::get_conn()->escapeIdentifier(
    DataObject::getSchema()->tableName(Member::class)
);

// Through raw SQL.
$count = DB::query('SELECT COUNT(*) FROM ' . $memberTable)->value();

// Through SQLSelect abstraction layer.
$count = SQLSelect::create('COUNT(*)', $memberTable)->execute()->value();

// Through the ORM.
$count = Member::get()->count();
```

If you do use raw SQL, you'll run the risk of breaking
various assumptions the ORM and code based on it have:

- Custom getter/setter methods (object property values can differ from database column values)
- `DataObject` hooks like `onBeforeWrite()` and `onBeforeDelete()` if running low-level `INSERT` or `UPDATE` queries
- Automatic casting
- Default values set through objects
- Database abstraction (some `DataObject` classes may not have their own tables, or may need a `JOIN` with other tables to get all of their field values)

We'll explain some ways to use the low-level APIs with the full power of SQL,
but still maintain a connection to the ORM where possible.

> [!WARNING]
> Please read our [security topic](/developer_guides/security) to find out
> how to properly prepare user input and variables for use in queries

## Usage

### Getting table names

> [!WARNING]
> Because of the way the ORM interacts with class inheritance, some models will spread their data across multiple tables. See [Joining tables for a DataObject inheritance chain](#joins-for-inheritance) below for information about how to handle that scenario.

While you could hardcode table names into your SQL queries, that invites human error and means you have to make sure you know exactly what table stores which data for every class in the class hierarchy of the model you're interested in. Luckily, the [`DataObjectSchema`](api:SilverStripe\ORM\DataObjectSchema) class knows all about the database schema for your `DataObject` models. The following methods in particular may be useful to you:

- [`baseDataTable()`](api:SilverStripe\ORM\DataObjectSchema::baseDataTable()): Get the name of the database table which holds the base data (i.e. `ID`, `ClassName`, `Created`, etc) for a given `DataObject` class
- [`classHasTable()`](api:SilverStripe\ORM\DataObjectSchema::classHasTable()): Check if there is a table in the database for a given `DataObject` class (i.e. whether that class defines columns not already present in another class further up the class hierarchy)
- [`sqlColumnForField()`](api:SilverStripe\ORM\DataObjectSchema::sqlColumnForField()): Get the ANSI-quoted table and column name for a given `DataObject` field (in `"Table"."Field"` format)
- [`tableForField()`](api:SilverStripe\ORM\DataObjectSchema::tableForField()): Get the table name in the class hierarchy which contains a given field column.
- [`tableName()`](api:SilverStripe\ORM\DataObjectSchema::tableName()): Get table name for the given class. Note that this does not confirm a table actually exists (or should exist), but returns the name that would be used if this table did exist. Make sure to call `classHasTable()` before using this table name in a query.

> [!TIP]
> While the default database connector will work fine without explicitly ANSI-quoting table names in queries, it is good practice to make sure they are quoted (especially if you're writing these queries in a module that will be publicly shared) to ensure your queries will work on other database connectors such as [`PostgreSQLDatabase`](https://github.com/silverstripe/silverstripe-postgresql) which explicitly require ANSI quoted table names.
>
> You can do that by passing the raw table name into [`DB::get_conn()->escapeIdentifier()`](api:SilverStripe\ORM\Connect\Database::escapeIdentifier()), which will ensure it is correctly escaped according to the rules of the currently active database connector.

### SELECT

Selection can be done by creating an instance of [`SQLSelect`](api:SilverStripe\ORM\Queries\SQLSelect), which allows
management of all elements of a SQL `SELECT` query, including columns, joined tables,
conditional filters, grouping, limiting, and sorting.

For example:

```php
$schema = DataObject::getSchema();
$playerTableName = DB::get_conn()->escapeIdentifier($schema->baseDataTable(Player::class));

$sqlQuery = new SQLSelect();
$sqlQuery->setFrom($playerTableName);

// Add a column to the `SELECT ()` clause
$sqlQuery->selectField('FieldName');
// You can pass an alias for the field in as the second argument
$sqlQuery->selectField('YEAR("Birthday")', 'Birthyear');

// Join another table onto the query
$teamIdField = $schema->sqlColumnForField(Player::class, 'TeamID');
$idField = $schema->sqlColumnForField(Team::class, 'ID');
$joinOnClause = "$teamIdField = $idField";
$sqlQuery->addLeftJoin($teamTableName, $joinOnClause);

// Combine another query using a union
$sqlQuery->addUnion($anotherSqlSelect, SQLSelect::UNION_ALL);

// There are methods for most SQL clauses, such as WHERE, ORDER BY, GROUP BY, etc
$sqlQuery->addWhere(['YEAR("Birthday") = ?' => 1982]);
// $sqlQuery->setOrderBy(...);
// $sqlQuery->setGroupBy(...);
// $sqlQuery->setHaving(...);
// $sqlQuery->setLimit(...);
// $sqlQuery->setDistinct(true);

// Get the raw SQL (optional) and parameters
$rawSQL = $sqlQuery->sql($parameters);

// Execute and return a Query object
$result = $sqlQuery->execute();

// Iterate over results
foreach ($result as $row) {
    echo $row['BirthYear'];
}
```

> [!NOTE]
> There's a lot to this API - we highly recommend that you check out the PHPDoc comments on the methods in this class to learn more about the specific usages of each - for example, the [`addWhere()`](api:SilverStripe\ORM\Queries\SQLSelect::addWhere()) method's PHPDoc includes multiple examples of different syntaxes that can be passed into it.

The result of [`SQLSelect::execute()`](api:SilverStripe\ORM\Queries\SQLSelect::execute()) is an array lightly wrapped in a database-specific subclass of [`Query`](api:SilverStripe\ORM\Connect\Query).
This class implements the [`IteratorAggregate`](https://www.php.net/manual/en/class.iteratoraggregate.php) interface, and provides convenience methods for accessing the data.

### DELETE

Deletion can be done either by creating a [`SQLDelete`](api:SilverStripe\ORM\Queries\SQLDelete) object, or by transforming a `SQLSelect` into a `SQLDelete`
object instead.

For example, creating a `SQLDelete` object:

```php
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLDelete;

$schema = DataObject::getSchema();
$siteTreeTable = DB::get_conn()->escapeIdentifier($schema->baseDataTable(SiteTree::class));

$query = SQLDelete::create()
    ->setFrom($siteTreeTable)
    ->setWhere([$schema->sqlColumnForField(SiteTree::class, 'ShowInMenus') => 0]);
$query->execute();
```

Alternatively, turning an existing `SQLSelect` into a delete:

```php
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLSelect;

$schema = DataObject::getSchema();
$siteTreeTable = DB::get_conn()->escapeIdentifier($schema->baseDataTable(SiteTree::class));

$query = SQLSelect::create()
    ->setFrom($siteTreeTable)
    ->setWhere([$schema->sqlColumnForField(SiteTree::class, 'ShowInMenus') => 0])
    ->toDelete();
$query->execute();
```

### INSERT/UPDATE

`INSERT` and `UPDATE` can be performed using the [`SQLInsert`](api:SilverStripe\ORM\Queries\SQLInsert) and [`SQLUpdate`](api:SilverStripe\ORM\Queries\SQLUpdate) classes.
These both have similar aspects in that they can modify content in
the database, but each are different in the way in which they behave.

These operations can be performed in batches by using the [`DB::manipulate`](api:SilverStripe\ORM\DB::manipulate())
method, which internally uses `SQLUpdate` / `SQLInsert`.

Each of these classes implement the [`SQLWriteExpression`](api:SilverStripe\ORM\Queries\SQLWriteExpression) interface, noting that each
accepts key/value pairs in a number of similar ways. These include the following
API methods:

- [`addAssignments()`](api:SilverStripe\ORM\Queries\SQLWriteExpression::addAssignments()) - Takes a list of assignments as an associative array of key => value pairs,
   where the value can also be an SQL expression.
- [`setAssignments()`](api:SilverStripe\ORM\Queries\SQLWriteExpression::setAssignments()) - Replaces all existing assignments with the specified list
- [`getAssignments()`](api:SilverStripe\ORM\Queries\SQLWriteExpression::getAssignments()) - Returns all currently given assignments, as an associative array
   in the format `['Column' => ['SQL' => ['parameters]]]`
- [`assign()`](api:SilverStripe\ORM\Queries\SQLWriteExpression::assign()) - Singular form of `addAssignments()`, but only assigns a single column value
- [`assignSQL()`](api:SilverStripe\ORM\Queries\SQLWriteExpression::assignSQL()) - Assigns a column the value of a specified SQL expression without parameters -
   `assignSQL('Column', 'SQL')` is shorthand for `assign('Column', ['SQL' => []])`

`SQLUpdate` also includes the following API methods:

- [`clear()`](api:SilverStripe\ORM\Queries\SQLUpdate::clear()) - Clears all assignments
- [`getTable()`](api:SilverStripe\ORM\Queries\SQLUpdate::getTable()) - Gets the table to update
- [`setTable()`](api:SilverStripe\ORM\Queries\SQLUpdate::setTable()) - Sets the table to update (this should be ANSI-quoted)
   e.g. `$query->setTable('"Page"');`

`SQLInsert` also includes the following API methods:

- [`clear()`](api:SilverStripe\ORM\Queries\SQLInsert::clear()) - Clears all rows
- [`clearRow()`](api:SilverStripe\ORM\Queries\SQLInsert::clearRow()) - Clears all assignments on the current row
- [`addRow()`](api:SilverStripe\ORM\Queries\SQLInsert::addRow()) - Adds another row of assignments, and sets the current row to the new row
- [`addRows()`](api:SilverStripe\ORM\Queries\SQLInsert::addRows()) - Adds a number of arrays, each representing a list of assignment rows,
   and sets the current row to the last one
- [`getColumns()`](api:SilverStripe\ORM\Queries\SQLInsert::getColumns()) - Gets the names of all distinct columns assigned
- [`getInto()`](api:SilverStripe\ORM\Queries\SQLInsert::getInto()) - Gets the table to insert into
- [`setInto()`](api:SilverStripe\ORM\Queries\SQLInsert::setInto()) - Sets the table to insert into (this should be ANSI-quoted),
   e.g. `$query->setInto('"Page"');`

For example:

```php
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLUpdate;

$schema = DataObject::getSchema();
$siteTreeTable = DB::get_conn()->escapeIdentifier($schema->baseDataTable(SiteTree::class));

$update = SQLUpdate::create($siteTreeTable)->addWhere(['"ID"' => 3]);

// assigning a list of items
$update->addAssignments([
    '"Title"' => 'Our Products',
    '"MenuTitle"' => 'Products',
]);

// Assigning a single value
$update->assign('"MenuTitle"', 'Products');

// Assigning a value using parameterised expression
$title = 'Products';
$update->assign('"MenuTitle"', [
    'CASE WHEN LENGTH("MenuTitle") > LENGTH(?) THEN "MenuTitle" ELSE ? END' =>
        [$title, $title],
]);

// Assigning a value using a pure SQL expression
$update->assignSQL('"Date"', 'NOW()');

// Perform the update
$update->execute();
```

In addition to assigning values, the `SQLInsert` object also supports multi-row
inserts. For database connectors and API that don't have multi-row insert support
these are translated internally as multiple single row inserts.

For example:

```php
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLInsert;

$schema = DataObject::getSchema();
$siteTreeTable = DB::get_conn()->escapeIdentifier($schema->baseDataTable(SiteTree::class));

$insert = SQLInsert::create($siteTreeTable);

// Add multiple rows in a single call. Note that column names do not need to be symmetric
$insert->addRows([
    ['"Title"' => 'Home', '"Content"' => '<p>This is our home page</p>'],
    ['"Title"' => 'About Us', '"ClassName"' => 'AboutPage'],
]);

// Adjust an assignment on the last row
$insert->assign('"Content"', '<p>This is about us</p>');

// Add another row
$insert->addRow(['"Title"' => 'Contact Us']);

// $columns will be ['"Title"', '"Content"', '"ClassName"'];
$columns = $insert->getColumns();

$insert->execute();
```

### Value checks

Raw SQL is handy for performance-optimized calls, e.g. when you want a single column rather than a full-blown object representation.

Example: Get the count from a relationship.

```php
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLSelect;

$schema = DataObject::getSchema();
$playerTableName = DB::get_conn()->escapeIdentifier($schema->baseDataTable(Player::class));
$teamTableName = DB::get_conn()->escapeIdentifier($schema->baseDataTable(Team::class));
$playerIdField = $schema->sqlColumnForField(Player::class, 'ID');
$playerTeamIdField = $schema->sqlColumnForField(Player::class, 'TeamID');
$teamIdField = $schema->sqlColumnForField(Team::class, 'ID');

$sqlQuery = new SQLSelect();
$sqlQuery->setFrom($playerTableName);
$sqlQuery->addSelect('COUNT(' . $playerIdField . ')');
$sqlQuery->addWhere([$teamIdField => 99]);
$sqlQuery->addLeftJoin('Team', $teamIdField ' = ' . $playerTeamIdField);
$count = $sqlQuery->execute()->value();
```

Note that in the ORM, this call would be executed in an efficient manner as well:

```php
$count = $myTeam->Players()->count();
```

### Value placeholders

In some of the examples here you will have noticed a `?` as part of the query, which is a placeholder for a value. This is called a "parameterized" or "prepared" query and is a good way to make sure your values are correctly escaped automatically to help protect yourself against SQL injection attacks.

With some queries you'll know ahead of time how many values you're including in your query, but sometimes (most notably when using the `IN` SQL operator) you will have a lot of values or a variable number of values and it can be difficult to get the correct number of `?` placeholders.

In those cases, you can use the [`DB::placeholders()`](api:SilverStripe\ORM\DB::placeholders()) method, which prepares these placeholders for you.

> [!NOTE]
> If you need this for some thing other than inclusion in an `IN` SQL operation, you can pass a custom delimiter as the second argument to `DB::placeholders()`.
>
> Also note that you can pass an integer in as the first argument rather than an array of values, if you want.

Example: Get the fields for all players in a team which has more than 15 wins.

```php
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLSelect;

$schema = DataObject::getSchema();
$playerTableName = DB::get_conn()->escapeIdentifier($schema->baseDataTable(Player::class));

$teamIds = Team::get()->filter('Wins:GreaterThan', 15)->column('ID');
$placeholders = DB::placeholders($teamIds);

$sqlQuery = new SQLSelect();
$sqlQuery->setFrom($playerTableName)->where([
    $schema->sqlColumnForField(Player::class, 'ID') . ' in (' . $placeholders . ')' => $ids,
]);
$results = $sqlQuery->execute();
```

> [!NOTE]
> This is obviously a contrived example - this could easily (and more efficiently) be done using the ORM:
>
> ```php
> $players = Player::get()->filter('Teams.Wins:GreaterThan', 15);
> ```

### Joining tables for a `DataObject` inheritance chain {#joins-for-inheritance}

In the [Introduction to the Data Model and ORM](data_model_and_orm/#subclasses) we discussed how `DataObject` inheretance chains can spread their data across multiple tables. The ORM handles this seemlessly, but when using the lower-level APIs we need to account for this ourselves by joining all of the relevant tables manually.

We also want to make sure to *only* select the records which are relevant for the actual class in the class hierarchy we're looking at. To do that, we can either use an `INNER JOIN`, or we can use a `WHERE` clause on the `ClassName` field. In the below example we're using a `WHERE` clause with a `LEFT JOIN` because it is likely more intuitive for developers who aren't intimately familar with SQL.

```php
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLSelect;

$schema = DataObject::getSchema();
$computerBaseTable = DB::get_conn()->escapeIdentifier($schema->baseDataTable(Computer::class));

$select = new SQLSelect();
$select->setFrom($computerTable);
$select->addWhere([$schema->sqlColumnForField(Computer::class, 'ClassName') => Computer::class]);

// Get all fields included in the query
$columns = $select->getSelect();
// If we're doing a "SELECT *" (which is the default select), get the field names from the DataObjectSchema instead
if (count($columns) === 1 && array_key_first($columns) === '*') {
    $columns = $schema->fieldSpecs(Computer::class);
}

// Make sure we join all the tables in the inheritance chain which are required for this query
foreach ($columns as $alias => $ansiQuotedColumn) {
    if ($schema->fieldSpec(Computer::class, $alias, DataObjectSchema::DB_ONLY)) {
        $fieldTable = $schema->tableForField(Computer::class, $alias);
        if (!$select->isJoinedTo($fieldTable)) {
            $quotedFieldTable = DB::get_conn()->escapeIdentifier($fieldTable);
            $joinOnClause = $schema->sqlColumnForField(Computer::class, 'ID') . ' = ' . $quotedFieldTable . '."ID"';
            $select->addLeftJoin($quotedFieldTable, $joinOnClause);
        }
    }
}
```

> [!TIP]
> If we want all of the fields for *all* models in the class hierarchy (mimicking `Product::get()` where `Product` is the first subclass of `DataObject` - see the example in the [Introduction to the Data Model and ORM](data_model_and_orm/#subclasses)), we can do this by using a `LEFT JOIN` (like above), ommitting the `WHERE` clause on the `ClassName` field, and making sure we join *all* tables for the inheritance chain regardless of the fields being selected. To do that, make sure you're using the first `DataObject` class as your first main query class (replace `Computer` above with `Product`, in this example), remove the call to `$select->addWhere()`, and add the following code to the end of the above example:
>
> ```php
> // Make sure we join all the tables for the model inheritance chain
> foreach (ClassInfo::subclassesFor(Product::class, includeBaseClass: false) as $class) {
>     if ($schema->classHasTable($class)) {
>         $classTable = $schema->tableName($class);
>         if (!$select->isJoinedTo($classTable)) {
>             $quotedClassTable = DB::get_conn()->escapeIdentifier($classTable);
>             $joinOnClause = $schema->sqlColumnForField(Product::class, 'ID') . ' = ' . $quotedClassTable . '."ID"';
>             $select->addLeftJoin($quotedClassTable, $joinOnClause);
>         }
>     }
> }
> ```

### Common table expressions (CTE aka the `WITH` clause) {#cte}

Common Table Expressions are a powerful tool both for optimising complex queries, and for creating recursive queries. You can use these by calling the [`SQLSelect::addWith()`](api:SilverStripe\ORM\Queries\SQLSelect::addWith()) method.

Older database servers don't support this functionality, and the core implementation is only valid for MySQL (though community modules may add support for other database connectors). If you are using this functionality in an open source module or a project that you can't guarantee the type and version of database being used, you should wrap the query in a condition checking if CTEs are supported. You can do that by calling [`DB::get_conn()->supportsCteQueries()`](api:SilverStripe\ORM\Connect\Database::supportsCteQueries()).

```php
if (DB::get_conn()->supportsCteQueries(true)) {
    // Supports recursive CTE clause
} elseif (DB::get_conn()->supportsCteQueries()) {
    // Supports non-recursive CTE clause
} else {
    // No CTE support
}
```

For an example of how to use this abstraction and how powerful it is, here is an example query that recursively fetches the ancestors of a given record.

```php
use App\Model\ObjectWithParent;
use SilverStripe\Core\Convert;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLSelect;

$schema = DataObject::getSchema();
$tableName = Convert::symbol2sql($schema->baseDataTable(ObjectWithParent::class));
$parentIdField = $schema->sqlColumnForField(ObjectWithParent::class, 'ParentID');
$idField = $schema->sqlColumnForField(ObjectWithParent::class, 'ID');
$cteIdField = Convert::symbol2sql('hierarchy_cte.parent_id');

// Only use the CTE functionality if it is supported by the current database
if (DB::get_conn()->supportsCteQueries(true)) {
    $baseQuery = SQLSelect::create()->setFrom($tableName);
    $cteQuery = SQLSelect::create(
        $parentIdField,
        $tableName,
        [
            "$parentIdField > 0",
            $idField => $someRecord->ID,
        ]
    );
    $recursiveQuery = SQLSelect::create(
        $parentIdField,
        ['"hierarchy_cte"', $tableName],
        [
            "$parentIdField > 0",
            "$idField = $cteIdField",
        ]
    );
    $cteQuery->addUnion($recursiveQuery);
    $baseQuery->addWith('hierarchy_cte', $cteQuery, ['parent_id'], true)
        ->addInnerJoin('hierarchy_cte', "$idField = $cteIdField");
    // This query result will include only the ancestors of whatever record is stored in the $someRecord variable.
    $ancestors = $baseQuery->execute();
} else {
    // provide an alternative implementation, e.g. a recursive PHP method which runs a query at each iteration
}
```

The SQL for that query, in MySQL, would look something like this:

```sql
WITH RECURSIVE "hierarchy_cte" ("parent_id") AS (
    (
        SELECT "ObjectWithParent"."ParentID" FROM "ObjectWithParent"
        WHERE ("ObjectWithParent"."ParentID" > 0) AND ("ObjectWithParent"."ID" = ?)
    ) UNION (
        SELECT "ObjectWithParent"."ParentID" FROM "hierarchy_cte", "ObjectWithParent"
        WHERE ("ObjectWithParent"."ParentID" > 0) AND ("ObjectWithParent"."ID" = "hierarchy_cte"."parent_id")
    )
)
SELECT * FROM "ObjectWithParent" INNER JOIN "hierarchy_cte" ON "ObjectWithParent"."ID" = "hierarchy_cte"."parent_id"
```

The PHPDoc for the [`SQLSelect::addWith()`](api:SilverStripe\ORM\Queries\SQLSelect::addWith()) method has more details about what each of the arguments are and how they're used, though note that you should ensure you understand the underlying SQL concept of CTE queries before using this API.

### Mapping

Creates a map based on the first two columns of the query result.
This can be useful for creating dropdowns.

Example: Show player names with their birth year, but set their birth dates as values.

```php
use SilverStripe\Forms\DropdownField;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Queries\SQLSelect;

$schema = DataObject::getSchema();
$playerTableName = DB::get_conn()->escapeIdentifier($schema->baseDataTable(Player::class));

$sqlQuery = new SQLSelect();
$sqlQuery->setFrom($playerTableName);
$sqlQuery->setSelect('"ID"');
$sqlQuery->selectField('CONCAT("Name", \' - \', YEAR("Birthdate")', 'NameWithBirthyear');
$map = $sqlQuery->execute()->map();

// The value of the selected option will be the record ID, and the display label will be the name and
// birthyear concatenation.
$field = new DropdownField('Birthdates', 'Birthdates', $map);
```

Note that going through `SQLSelect` is only necessary here
because of the custom SQL value transformation (`YEAR()`).
An alternative approach would be a custom getter in the object definition:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $db = [
        'Name' => 'Varchar',
        'Birthdate' => 'Date',
    ];

    public function getNameWithBirthyear()
    {
        return date('y', $this->Birthdate);
    }
}
```

```php
use App\Model\Player;

$players = Player::get();
$map = $players->map('ID', 'NameWithBirthyear');
```

### True raw SQL

Up until now we've still been using an abstraction layer to perform SQL queries - but there might be times where it's just cleaner to explicitly use raw SQL. You can do that with either the [`DB::query()`](api:SilverStripe\ORM\DB::query()) or [`DB::prepared_query()`](api:SilverStripe\ORM\DB::prepared_query()) method.

Directly querying the database:

```php
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\ORM\DB;
use SilverStripe\ORM\DataObject;

$schema = DataObject::getSchema();
$siteTreeBaseTable = DB::get_conn()->escapeIdentifier($schema->baseDataTable(SiteTree::class));
$showInMenusField = $schema->sqlColumnForField(SiteTree::class, 'ShowInMenus');

// Use DB::query() if you don't need to pass in any parameters (values)
$count = DB::query('SELECT COUNT(*) FROM ' . $siteTreeBaseTable)->value();

// Use DB::prepared_query() if you need to pass in some parameters (values) e.g. for WHERE clauses
$results = DB::prepared_query('DELETE FROM ' . $siteTreeBaseTable . ' WHERE ' . $showInMenusField . ' = ?', [0]);
foreach ($results as $row) {
    // $row is an array representing the database row, just like with SQLSelect.
}
```

> [!TIP]
> Note that you do *not* have to call `execute()` with these methods, unlike the abstraction layer in the other examples. This is because you're passing the entire query into the method - you can't change the query after it's passed in, so it gets executed right away. The return type for these methods is the same as the return type for the [`execute()`](api::SilverStripe\ORM\Queries\SQLExpression::execute()) methods on the `SQLExpression` classes.

### Data types

The following PHP types are used to return database content:

- booleans will be an integer 1 or 0, to ensure consistency with MySQL that doesn't have native booleans
- integer types returned as integers
- floating point / decimal types returned as floats
- strings returned as strings
- dates / datetimes returned as strings

## Related lessons

- [Building custom SQL](https://www.silverstripe.org/learn/lessons/v4/beyond-the-orm-building-custom-sql-1)

## Related documentation

- [Introduction to the Data Model and ORM](data_model_and_orm)

## API documentation

- [DataObject](api:SilverStripe\ORM\DataObject)
- [SQLSelect](api:SilverStripe\ORM\Queries\SQLSelect)
- [DB](api:SilverStripe\ORM\DB)
- [Query](api:SilverStripe\ORM\Connect\Query)
- [Database](api:SilverStripe\ORM\Connect\Database)
