---
title: HTTP Cache Headers
summary: Set the correct HTTP cache headers for your responses.
icon: tachometer-alt
---

# HTTP cache headers

HTTP cache headers instruct HTTP caches (e.g. browsers, CDNs, and proxies) how to store and serve responses. Proper configuration can significantly improve website performance.

By default, Silverstripe CMS sends headers that prevent caching: `Cache-Control: no-cache, must-revalidate`.

> [!WARNING]
> HTTP caching can be a great way to speed up your website, but needs to be properly applied.
> Getting it wrong can accidentally expose draft pages or other protected content.

## Cache control headers

### Overview

Silverstripe CMS provides `HTTPCacheControlMiddleware` to help developers manage HTTP cache headers safely. This class helps prevent accidental caching of private content such as draft content or member specific content. It's an abstraction on top of the `HTTPResponse->addHeader()` low-level API.

The `HTTPCacheControlMiddleware` API makes it easier to express your caching preferences
without running the risk of overriding essential core safety measures.
Most commonly, these APIs will prevent HTTP caching of draft content.

It will also prevent caching of content generated with an active session,
since the system can't tell whether session data was used to vary the output.
In this case, it's up to the developer to opt-in to caching,
after ensuring that certain execution paths are safe despite of using sessions.

The system behaviour does not guard against accidentally caching "private" content,
since there are too many variations under which output could be considered private
(e.g. a custom "approval" flag on a comment object). It is up to
the developer to ensure caching is used appropriately there.

The [`HTTPCacheControlMiddleware`](api:SilverStripe\Control\Middleware\HTTPCacheControlMiddleware) class replaces
(deprecated) caching methods in the `HTTP` helper class.
It comes with methods which let developers safely interact with the `Cache-Control` header.

### `publicCache()`

Sets cache control headers to a cacheable state. Will use the `public` directive and remove the `private` if present as that is a contradictory directive.

### `privateCache()`

Sets cache control headers to a mostly non-cacheable state and uses the `private` directive.

Indicates that the response is intended for a single user and must not be stored by a shared cache.

A private cache (e.g. Web Browser) may store the response. Also removes `public` as this is a contradictory directive.

> [!WARNING]
> Private caching will cache at the client level, not at the a user level. While it stops shared servers (like CDNs) from caching your personalized data, it doesn't stop other people using the same browser from seeing each others cached content.
> For example, if multiple family members share a computer and browser, one person might accidentally see cached information meant for another family member.

Use `disableCache()` instead if you are unsure about caching details. Takes precedence over unforced `enableCache()`, `privateCache()` or `publicCache()` calls.

### `enableCache()`

Sets cache control headers to a cacheable state, though without the `public` directive that `publicCache()` will set.

Removes the `no-store` directive unless a `max-age` is set; other directives will remain in place. Use alongside `setMaxAge()` to activate caching.

Unlike `publicCache()`, does not set `public` directive. Usually, `setMaxAge()` is sufficient. Use `publicCache()` if this is explicitly required.

### `disableCache()`

Sets cache control headers to a non-cacheable state.

Removes all state and replaces it with `no-cache, no-store, must-revalidate`.

### Priority

Each of these highlevel methods has a boolean `$force` parameter which determines
their application priority regardless of execution order.
The priority order is as followed, sorted in descending order
(earlier items will overrule later items):

- `disableCache($force=true)`
- `privateCache($force=true)`
- `publicCache($force=true)`
- `enableCache($force=true)`
- `disableCache()`
- `privateCache()`
- `publicCache()`
- `enableCache()`

## Cache control examples

### Global opt-in for page content

Enable caching for all page content (through `PageController`).

```php
namespace {
    use SilverStripe\CMS\Controllers\ContentController;
    use SilverStripe\Control\Middleware\HTTPCacheControlMiddleware;

    class PageController extends ContentController
    {
        public function init()
        {
            HTTPCacheControlMiddleware::singleton()
                ->enableCache()
                // 1 minute
                ->setMaxAge(60);

            parent::init();
        }
    }
}
```

Note: Silverstripe CMS will still override this preference when a session is active,
a [CSRF token](/developer_guides/forms/form_security) token is present,
or draft content has been requested.

### Opt-out for a particular controller action

If a controller output relies on session data, cookies,
permission checks or other triggers for conditional output,
you can disable caching either on a controller level
(through `init()`) or for a particular action.

```php
namespace {
    use SilverStripe\CMS\Controllers\ContentController;
    use SilverStripe\Control\Middleware\HTTPCacheControlMiddleware;

    class PageController extends ContentController
    {
        public function myprivateaction($request)
        {
            HTTPCacheControlMiddleware::singleton()
                ->disableCache();

            return $this->myPrivateResponse();
        }
    }
}
```

Note: Silverstripe CMS will still override this preference when a session is active,
a [CSRF token](/developer_guides/forms/form_security) token is present,
or draft content has been requested.

### Global opt-in, ignoring session (advanced)

This can be helpful in situations where forms are embedded on the website.
Silverstripe CMS will still override this preference when draft content has been requested.
CAUTION: This mode relies on a developer examining each execution path to ensure
that no session data is used to vary output.

Use case: By default, forms include a [CSRF token](/developer_guides/forms/form_security)
which starts a session with a value that's unique to the visitor, which makes the output uncacheable.
But any subsequent requests by this visitor will also carry a session, leading to uncacheable output
for this visitor. This is the case even if the output does not contain any forms,
and does not vary for this particular visitor. Forms can also contain submission data
when they're redisplayed after a validation error.

```php
namespace {
    use SilverStripe\CMS\Controllers\ContentController;
    use SilverStripe\Control\Middleware\HTTPCacheControlMiddleware;

    class PageController extends ContentController
    {
        public function init()
        {
            HTTPCacheControlMiddleware::singleton()
                // DANGER ZONE
                ->enableCache($force = true)
                // 1 minute
                ->setMaxAge(60);

            parent::init();
        }
    }
}
```

## Max age

The cache age determines the lifetime of your cache, in seconds.
It only takes effect if you instruct the cache control
that your response is cacheable in the first place
(via `enableCache()`, `publicCache()` or `privateCache()`),
or via modifying the `HTTP.cache_control` defaults).

```php
use SilverStripe\Control\Middleware\HTTPCacheControlMiddleware;
HTTPCacheControlMiddleware::singleton()
    ->setMaxAge(60)
```

Note that `setMaxAge(0)` is NOT sufficient to disable caching in all cases,
use `disableCache()` instead.

### Last modified

Used to set the modification date to something more recent than the default. [`DataObject::__construct()`](api:SilverStripe\ORM\DataObject::__construct()) calls
[`HTTP::register_modification_date()`](api:SilverStripe\Control\HTTP::register_modification_date()) whenever a record comes from the database ensuring the newest date is present.

```php
use SilverStripe\Control\HTTP;
HTTP::register_modification_date('2014-10-10');
```

### Vary

A `Vary` header tells caches which aspects of the response should be considered
when calculating a cache key, usually in addition to the full URL.
By default, Silverstripe CMS will output a `Vary` header with the following content:

```text
Vary: X-Forwarded-Protocol
```

> [!IMPORTANT]
> For historical reasons the default vary header is `X-Forwarded-Protocol` instead of the standard `X-Forwarded-Proto`.
> If you are using a CDN or proxy which relies on `X-Forwarded-Proto` to determine the protocol of the request, you should change the default vary header to `X-Forwarded-Proto` to ensure that cached content is correctly served over both HTTP and HTTPS.

To change the value of the `Vary` header, you can change this value by disabling the old header and specifying the new header in configuration:

```yml
SilverStripe\Control\Middleware\HTTPCacheControlMiddleware:
  defaultVary:
    X-Forwarded-Protocol: false
    X-Forwarded-Proto: true
```

You can also remove the default `Vary` header value by setting it to `null`:

```yml
SilverStripe\Control\Middleware\HTTPCacheControlMiddleware:
  defaultVary: null
```

Note that if you use `Director::is_ajax()` on cached pages
then you should add `X-Requested-With` to the vary header.

## Testing

HTTP Cache headers are disabled in developer environments by default to prevent any confusion around content not updating. To enable HTTP Cache Headers in dev mode you can add the following in YAML config.

```yml
---
Name: 'app_httpconfig'
After: '#httpconfig-dev'
Only:
  environment: dev
---
SilverStripe\Control\Middleware\HTTPCacheControlMiddleware:
  defaultState: 'enabled'
  defaultForcingLevel: 0
```

## Debugging HTTP cache headers

You can use browser developer tools or command-line tools like `curl` to inspect HTTP cache headers and verify that they are configured correctly.

For example, using `curl`:

```bash
curl -I https://example.com/mypage
```

The output will show the HTTP headers, including `Cache-Control`, `Vary`, and `Age`.
