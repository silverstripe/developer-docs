---
title: Cache adapters
summary: Cache adapters supported by symfony/cache
icon: tachometer-alt
---

# Cache adapters

Cache adapters determine how cached data is stored and retrieved. Choosing the right adapter can significantly impact your application's performance.

We use the `symfony/cache` library which supports various [cache adapters](https://github.com/symfony/cache/tree/6.1/Adapter).

Silverstripe CMS tries to provide a sensible default cache implementation for your system
through the [`DefaultCacheFactory`](api:SilverStripe\Core\Cache\DefaultCacheFactory) implementation.

The `DefaultCacheFactory` chooses:

- `PhpFilesAdapter` (PHP with [opcache](https://php.net/manual/en/book.opcache.php) enabled).
  This cache has relatively low [memory defaults](https://php.net/manual/en/opcache.configuration.php#ini.opcache.memory-consumption).
  We recommend increasing it for large applications, or enabling the
  [`file_cache` fallback](https://php.net/manual/en/opcache.configuration.php#ini.opcache.file-cache).
  You must have [`opcache.enable_cli`](https://www.php.net/manual/en/opcache.configuration.php#ini.opcache.enable-cli) set to `true`
  to use this cache adapter. This is so that your cache is shared between CLI and the webserver.
- `FilesystemAdapter` if the above isn't available

## Adding an in-memory cache adapter

The in-memory cache adapters provided by default are:

- Memcached
- Redis
- APCu

The cache adapter needs to be available before configuration has been loaded, so we use an environment variable to determine which class will be used to instantiate the in-memory cache adapter. The class must be referenced using its Fully Qualified Class Name (including namespace), and must be an instance of [`InMemoryCacheFactory`](api:SilverStripe\Core\Cache\InMemoryCacheFactory).

```bash
SS_IN_MEMORY_CACHE_FACTORY="SilverStripe\Core\Cache\MemcachedCacheFactory"
```

Silverstripe CMS comes with three in-memory cache factories you can choose from, each with their own requirements. You can of course add your own, as well.

### Memcached cache

[Memcached](https://www.danga.com/memcached/) is a "high-performance, distributed memory object caching system". To use this cache, you must install the [memcached PHP extension](https://php.net/memcached).

You can tell the cache adapter which Memcached server(s) to connect to by defining a DSN in the `SS_MEMCACHED_DSN` environment variable.

> [!TIP]
> The format for the DSN is exactly as defined in [the Symfony documentation](https://symfony.com/doc/current/components/cache/adapters/memcached_adapter.html#configure-the-connection).

```bash
SS_IN_MEMORY_CACHE_FACTORY="SilverStripe\Core\Cache\MemcachedCacheFactory"
SS_MEMCACHED_DSN="memcached://localhost:11211"
```

### Redis cache

[Redis](https://redis.io/) is an "in-memory database for caching and streaming" with built-in replication and a lot of deployment options. To use this cache, you must install one of:

- [predis/predis](https://github.com/predis/predis/)
- [cachewerk/relay](https://github.com/cachewerk/relay)
- [the Redis PHP extension](https://github.com/phpredis/phpredis)

You can tell the cache adapter which Redis server(s) to connect to by defining a DSN in the `SS_REDIS_DSN` environment variable.

> [!TIP]
> The format for the DSN is exactly as defined in [the Symfony documentation](https://symfony.com/doc/current/components/cache/adapters/redis_adapter.html#configure-the-connection).

```bash
SS_IN_MEMORY_CACHE_FACTORY="SilverStripe\Core\Cache\RedisCacheFactory"
SS_REDIS_DSN="redis://verysecurepassword@localhost:6379"
```

### APCu cache

APCu is "an in-memory key-value store for PHP". This runs locally on the same computer as your webserver, and is only available for the webserver itself. To use this cache, you must install the [APCu PHP extension](https://www.php.net/apcu).

> [!WARNING]
> APCu cache cannot be shared with your CLI, which means flushing cache from the terminal will not flush the cache your webserver uses.
>
> The filesystem cache will still be used as a backup, which *is* shared with CLI, so flushing the cache with a web request will always flush the cache CLI uses.

We include this option because it requires very little effort to set up, so it may be appropriate for smaller projects. Just remember to always flush the cache with an HTTP request using `?flush=1` or the `--flush` CLI flag.

```bash
SS_IN_MEMORY_CACHE_FACTORY="SilverStripe\Core\Cache\ApcuCacheFactory"
```
