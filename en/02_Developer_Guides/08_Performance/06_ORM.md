---
title: ORM Performance
summary: Configuration and tips for improving ORM performance
---

## ORM Performance

### Indexes

You can define indexes for your ORM queries using the `$indexes` configuration property in your `DataObject` subclasses. See the [Indexes](/developer_guides/model/indexes) section for more information.

### Skipping check and repair during dev/build {#skip-check-and-repair}

When you run `dev/build`, there is a step that checks the integrity of the database tables (via `CHECK TABLE`) and repairs issues (via `REPAIR TABLE`) if possible.

For tables with many records (tens/hundreds of thousands) this can be slow. If you identify that you have some specific `DataObject` models with lots of records
which are slowing down your `dev/build`, you might want to explicitly skip checks for those:

```yml
SilverStripe\ORM\Connect\DBSchemaManager:
  exclude_models_from_db_checks:
    - App\Model\ModelWithManyRecords
```

[info]
Note: The entire inheritance chain (both ancestors and descendents) of models in that configuration array will be excluded from the check and repair step.
[/info]

You can also disable these checks entirely:

```yml
SilverStripe\ORM\Connect\DBSchemaManager:
  check_and_repair_on_build: false
```

You can always manually trigger a check and repair (e.g. in a [`BuildTask`](api:SilverStripe/Dev/BuildTask)) by calling [`DB::check_and_repair_table()`](api:SilverStripe\ORM\DB::check_and_repair_table()). This ignores the above configuration.
