---
title: Read-only database replicas
summary: Using read-only database replicas to improve performance
---

# Read-only database replicas

Read-only replicas are additional databases that are used to offload read queries from the primary database, which can improve performance by reducing the load on the primary database.

Read-only replicas are configured by adding environment variables that match the primary environment variable and suffixing `_REPLICA_<replica-number>` to the variable name, where `<replica_number>` is the replica number padding by a zero if it's less than 10, for example `SS_DATABASE_SERVER` becomes `SS_DATABASE_SERVER_REPLICA_01` for the first replica, or `SS_DATABASE_SERVER_REPLICA_12` for the 12th replica. Replias must be numbered sequentially starting from `01`.

```bash
# Primary database
SS_DATABASE_CLASS="MySQLDatabase"
SS_DATABASE_SERVER="my-db-server"
SS_DATABASE_PORT="3306"
SS_DATABASE_USERNAME="my-user"
SS_DATABASE_PASSWORD="my-password"
SS_DATABASE_NAME="db"

# Read-only replica
SS_DATABASE_SERVER_REPLICA_01="my-db-replica"
SS_DATABASE_PORT_REPLICA_01="3306"
SS_DATABASE_USERNAME_REPLICA_01="my-replica-user"
SS_DATABASE_PASSWORD_REPLICA_01="my-replica-password"
```

Replicas cannot define different configuration values for `SS_DATABASE_CLASS`, `SS_DATABASE_NAME`, or `SS_DATABASE_CHOOSE_NAME`. They are restricted to prevent strange issues that could arise from having inconsistent database configurations across replicas.

If one or more read-only replicas have been configured, then for each request one of the read-only replicas will be randomly selected from the pool of available replicas to handle queries for the rest of the request cycle. However the primary database will be used instead if one of the follow criteria has been met:

- The current query includes any mutable SQL such as `INSERT` or `DELETE`. The primary database will be used for the current query, as well as any future queries, including read queries, for the rest of the current request cycle. Mutable SQL is defined on [`DBConnector::isQueryMutable()`](api:SilverStripe\ORM\Connect\DBConnector::isQueryMutable()).
- The HTTP request matches a routing rule defined in [`Director.must_use_primary_db_rules`](api:SilverStripe\Control\Director->must_use_primary_db_rules). By default the URL paths `Security/*`, `dev/*`, and `admin/*` (if `silverstripe/admin` is installed) are covered by this by default.
- A user with CMS access is logged in. This is done to ensure that logged in users will correctly see any CMS updates on the website frontend. Users without CMS access will still use a read-only replica.
- For any query that goes through a call to [`DataQuery::execute()`](api:SilverStripe\ORM\DataQuery::execute()), the `DataObject` subclass being queried is configured with [`DataObject.must_use_primary_db`](api:SilverStripe\ORM\DataObject->must_use_primary_db) set to `true`. This includes most commonly used ORM methods such as [`DataObject::get()`](api:SilverStripe\ORM\DataObject::get()), and excludes [`SQLSelect`](api:SilverStripe\ORM\Queries\SQLSelect) methods. By default all core security related `DataObject` subclasses have `must_use_primary_db` set to `true`.
- Any code wrapped in a call to [`DB::withPrimary()`](api:SilverStripe\ORM\DB::withPrimary()).
- All queries that result from using the CLI.

## Forcing use of the primary database

When using database replicas you may need to force the use of the primary database to ensure there are no issues with the data being out of sync. The following methods are available to force the use of the primary database:

[`DB::setMustUsePrimaryDB()`](api:SilverStripe\ORM\DB::setMustUsePrimaryDB()) will force the use of the primary database for the rest of current request cycle. Once it has ben set it cannot be unset.

```php
// Code here can use a replica

DB::setMustUsePrimaryDB();

// Code here will only use the primary database
```

Code wrapped in a call to [`DB::withPrimary()`](api:SilverStripe\ORM\DB::withPrimary()) will always use the primary database.

```php
// Code here can use a replica

DB::withPrimary(function () {
    // Code here will only use the primary database
});

// Code here can use a replica
```
