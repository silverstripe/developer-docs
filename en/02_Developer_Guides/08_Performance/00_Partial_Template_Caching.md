---
title: Partial template caching
summary: Cache Silverstripe CMS templates to reduce database queries.
icon: tachometer-alt
---

# Partial template caching

Partial template caching allows you to cache rendered portions of a template, so that it does not need to be recomputed on each request.

See [Partial template caching](../templates/partial_template_caching) in the templates section for detailed usage instructions.

This page discusses some of the performance considerations.

## Cache block conditionals

Use conditions whenever possible. The cache tag supports optional `if` or `unless` conditions, which are highly recommended.

> [!WARNING]
> Avoid heavy computations in conditionals, as they are evaluated every time the template needs to be rendered.

If you cache without conditions:

- The cache backend will be queried for the cache block on every template render even if it's not needed.
- Your cache may be cluttered with redundant data, especially with the default filesystem backend.

For example, if you use `$DataObject->ID` as a key for the block, consider adding a condition that the ID is greater than zero:

```ss
<% cached $MenuItem.ID if $MenuItem.ID > 0 %>
```

To cache content for anonymous users, but dynamically calculate it for logged-in members, use:

```ss
<% cached unless $CurrentUser %>
```

## Cache invalidation strategies

### Aggregates-based invalidation {#aggregates}

Sometimes you may want to invalidate cache when any object in a set changes, or when objects in a relationship
change. To do this, you may use [DataList](api:SilverStripe\ORM\DataList) aggregate methods (which we call Aggregates).
These perform SQL aggregate queries on sets of [DataObject](api:SilverStripe\ORM\DataObject)s.

Some useful methods of the [`DataList`](api:SilverStripe\ORM\DataList) class for this purpose include:

- `int count()`: Returns the number of items in this DataList.
- `mixed max(string $fieldName)`: Returns the maximum value of the given field in this DataList.
- `mixed min(string $fieldName)`: Returns the minimum value of the given field in this DataList.
- `mixed avg(string $fieldName)`: Returns the average value of the given field in this DataList.
- `mixed sum(string $fieldName)`: Returns the sum of the values of the given field in this DataList.

To construct a `DataList` over a `DataObject`, you can use the global template variable `$List`.

For example, to cache a menu but invalidate that cache whenever any page is edited:

```ss
<% cached
     'navigation',
     $List('SilverStripe\CMS\Model\SiteTree').max('LastEdited'),
     $List('SilverStripe\CMS\Model\SiteTree').count()
%>
```

> [!NOTE]
> The use of the fully qualified classname is necessary.
>
> Using both `.max('LastEdited')` and `.count()` ensures we check for any object edited or deleted since the cache was last built.

In this example, the cache will update whenever a page is added, removed or edited.

> [!WARNING]
> Be careful when using aggregates. The database is often a performance bottleneck. Keep in mind that every key of every cached block is recalculated for every template render, regardless of caching result. Aggregating SQL queries can put more load on the database than simple select queries, especially if you query records by Primary Key or join tables using database indices properly.
>
> Consider whether not caching at all is cheaper than caching a block using heavy aggregating SQL queries.
>
> Consider the following two versions:
>
> ```ss
> # Version 1 (bad)
>
> <% cached
>     $List('SilverStripe\CMS\Model\SiteTree').max('LastEdited'),
>     $List('SilverStripe\CMS\Model\SiteTree').count()
> %>
>     Parent title is: $Me.Parent.Title
> <% end_cached %>
> ```
>
> ```ss
> # Version 2 (better performance than Version 1)
>
> Parent title is: $Me.Parent.Title
> ```
>
> `Version 1` always generates two heavy aggregating SQL queries for the database on every
> template render.
> `Version 2` always generates a single and more performant SQL query fetching the record by its Primary Key.
>
> Note also that if you use the same aggregate in a template more than once, it will be recalculated every time
> unless you move it out into a separate
> [controller method](../templates/partial_template_caching/#cache-key-calculated-in-controller).
> [Object Caching](../templates/caching/#object-caching) only works for single variables and not for chained expressions.

### Time-based invalidation

In some situations it's more important to be fast than to always be showing the latest data. One way to achieve this is to construct the cache key to invalidate less often than the data updates. This ensures constant rendering time, regardless of how often the data updates.

For instance, if you show blog statistics, but are happy with slightly stale data:

```ss
<% cached 'blogstatistics', $Blog.ID %>
```

This doesn't require any additional SQL queries and will invalidate after the cache lifetime expires. Cache lifetime is [configurable only on a site-wide basis](/developer_guides/templates/partial_template_caching/#cache-storage). For more control, add a function to your controller:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyObject extends DataObject
{
    // ...

    public function getBlogStatisticsCount()
    {
        // Returns a new number every five minutes
        return (int)(time() / 60 / 5);
    }
}
```

Then use it in the cache key:

```ss
<% cached 'blogstatistics', $Blog.ID, $BlogStatisticsCount %>
```

## Cache backend

The template engine uses [Injector](../extending/injector) service `Psr\SimpleCache\CacheInterface.cacheblock` as its caching backend. The default definition of that service is conservative, and relies on the server filesystem. While this is the most common denominator, it's not the most robust or performant implementation. If you have a better solution available on your platform, you should consider tuning this setting. To swap the cache backend for partial template cache blocks, redefine this service for the Injector.

For example:

> [!NOTE]
> For the below example to work it is necessary to have the Injector service `App\Cache\Service.memcached` defined somewhere in the configs.

```yml
# app/_config/cache.yml
---
Name: app-cache
After:
  - 'corecache'
---
SilverStripe\Core\Injector\Injector:
  Psr\SimpleCache\CacheInterface.cacheblock: '%$App\Cache\Service.memcached'
```

> [!WARNING]
> The default filesystem cache backend does not support auto cleanup of the residual files with expired cache records. If your project relies on Template Caching heavily (e.g. thousands of cache records daily), you may want to monitor the filesystem storage. If you don't, its capacity may eventually be exhausted.
