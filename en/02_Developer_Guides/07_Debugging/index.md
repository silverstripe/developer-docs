---
title: Debugging
summary: Learn how to identify errors in your application and best practice for logging application errors.
icon: bug
---
# Debugging

Silverstripe CMS can be a large and complex framework to debug, but there are ways to make debugging less painful. In this
guide we show the basics on defining the correct [Environment Type](environment_types) for your application and other
built-in helpers for dealing with application errors.

[CHILDREN]

## Performance

See the [Profiling](../performance/profiling) documentation for more information on profiling Silverstripe CMS to track down
bottle-necks and identify slow moving parts of your application chain.

## Debugging utilities

The [Debug](api:SilverStripe\Dev\Debug) class contains a number of static utility methods for more advanced debugging.

```php
use SilverStripe\Dev\Backtrace;
use SilverStripe\Dev\Debug;

Debug::show($myVariable);
// similar to print_r($myVariable) but shows it in a more useful format.

Debug::message("Wow, that's great");
// prints a short debugging message.

Backtrace::backtrace();
// prints a calls-stack
```

## Debugging database queries

> [!INFO]
> This functionality is available from version 5.2.

You can opt in to including a comment on all ORM queries indicating where the query was executed by setting the [DBQueryBuilder.trace_query_origin](api:SilverStripe\ORM\Connect\DBQueryBuilder->trace_query_origin) configuration property or the `SS_TRACE_DB_QUERY_ORIGIN` environment variable to `true`.

Note that the environment variable, if set, will take precedence over the configuration property value.

This is useful if you're using a database proxy, or if you're using the [`showqueries` URL variable](url_variable_tools/#database).

## API documentation

- [Backtrace](api:SilverStripe\Dev\Backtrace)
- [Debug](api:SilverStripe\Dev\Debug)
