---
title: Sessions
summary: A set of static methods for manipulating PHP sessions.
icon: user
---

# Sessions

Session support in PHP consists of a way to preserve certain data across subsequent accesses such as logged in user
information and security tokens.

In order to support things like testing, the session is associated with a particular Controller.  In normal usage,
this is loaded from and saved to the regular PHP session, but for things like static-page-generation and
unit-testing, you can create multiple Controllers, each with their own session.

## Getting the session instance

If you're in a controller, the `Session` object will be bound to the `HTTPRequest` for your controller.

```php
namespace App\Control;

use SilverStripe\Control\Controller;

class MyController extends Controller
{
    public function getSession()
    {
        return $this->getRequest()->getSession();
    }
}
```

Otherwise, if you're not in a controller, get the request as a service.

```php
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Core\Injector\Injector;

$request = Injector::inst()->get(HTTPRequest::class);
$session = $request->getSession();
```

## Set

```php
$session->set('MyValue', 6);
```

Saves the value of to session data. You can also save arrays or serialized objects in session (but note there may be
size restrictions as to how much you can save).

```php
// saves an array
$session->set('MyArrayOfValues', ['1','2','3']);

// saves an object (you'll have to unserialize it back)
$object = new Object();
$session->set('MyObject', serialize($object));
```

## Get

Once you have saved a value to the Session you can access it by using the `get` function. Like the `set` function you
can use this anywhere in your PHP files.

```php
echo $session->get('MyValue');
// returns 6

$data = $session->get('MyArrayOfValues');
// $data = [1,2,3]

$object = unserialize($session->get('MyObject', $object));
// $object = Object()
```

## GetAll

You can also get all the values in the session at once. This is useful for debugging.

```php
$session->getAll();
// returns an array of all the session values.
```

## Clear

Once you have accessed a value from the Session it doesn't automatically wipe the value from the Session, you have
to specifically remove it.

```php
$session->clear('MyValue');
```

Or you can clear every single value in the session at once. Note Silverstripe CMS stores some of its own session data
including form and page comment information. None of this is vital but `clear_all` will clear everything.

```php
$session->clearAll();
```

## Configuration

### Session lifetime

By default, the client-side session cookie will only last until the user closes their browser, and the session on the server-side will live for the number of seconds set in the [`session.gc_maxlifetime`](https://www.php.net/manual/en/session.configuration.php#ini.session.gc-maxlifetime) ini configuration since it was last touched.

You can configure the session lifetime by setting the [`Session.timeout`](SilverStripe\Control\Session->timeout) configuration property to the number of seconds the session should be valid for since the last modified time. If one of the session handlers included with `silverstripe/framework` is used, this will be used for both setting the "expires" attribute on the client-side cookie, as well as for determining when the server-side record for storing the session is deleted.

```yml
SilverStripe\Control\Session:
  timeout: 86400
```

> [!WARNING]
> If you use a save handler which isn't included in `silverstripe/framework`, it may treat the session lifetime differently. You should check its documentation or implementation to understand how it works.

### Save handler

You can choose how sessions are handled by setting the [`Session.save_handler`](api:SilverStripe\Control\Session->save_handler) configuration property or the `SS_SESSION_SAVE_HANDLER_CLASS` environment variable to the FQCN of your preferred save handler. Setting the environment variable takes precedence over the YAML configuration.

The default session save handler is [`FileSessionHandler`](api:SilverStripe\Control\SessionHandler\FileSessionHandler).

If you want to use the session handler defined in your `php.ini` file instead (which is usually the built-in file session handler), you can set the `Session.save_handler` configuration to `null`.

```yml
SilverStripe\Control\Session:
  save_handler: null
```

You can also set it to the FQCN or injector service name of any session handler that implements [`SessionHandlerInterface`](https://www.php.net/manual/en/class.sessionhandlerinterface.php). `silverstripe/framework` comes with several non-blocking session save handlers you can use.

> [!WARNING]
> In edge case scenarios, for example if your application wants to modify a session value *based on the value that is already set* and must do so for each request, non-blocking sessions may cause unexpected results.

#### `FileSessionHandler`

The default file-based session handler for PHP holds a lock on the session file while the session is open. This means that multiple concurrent requests from the same user have to wait for one another to finish processing after a session has been started. This includes AJAX requests.

To resolve this problem, Silverstripe CMS comes with [`FileSessionHandler`](api:SilverStripe\Control\SessionHandler\FileSessionHandler).

`FileSessionHandler` differs from the default PHP file session handler in the following ways:

1. It doesn't lock the session file, and therefore doesn't block concurrent requests.
1. The [`Session.timeout`](api:SilverStripe\Control\Session->timeout) configuration property is used as the source of truth for the lifetime of session files (see [session lifetime](#session-lifetime) above).
1. If there are problems reading or writing to session files, the [default logging service](/developer_guides/debugging/error_handling/) is used to log them.

#### `CacheSessionHandler`

If you want a more performant session save handler, you can use the [`CacheSessionHandler`](api:SilverStripe\Control\SessionHandler\CacheSessionHandler). This session save handler can use any cache that implements [the PSR-16 `Psr\SimpleCache\CacheInterface`](https://www.php-fig.org/psr/psr-16/#21-cacheinterface), though we recommend specifically using an in-memory cache adapter that gets instantiated from a factory implementing [`InMemoryCacheFactory`](api:SilverStripe\Core\Cache\InMemoryCacheFactory), such as [`MemcachedCacheFactory`](api:SilverStripe\Core\Cache\MemcachedCacheFactory) or [`RedisCacheFactory`](api:SilverStripe\Core\Cache\RedisCacheFactory).

Set this save handler with the following YAML configuration, or by setting the `SS_SESSION_SAVE_HANDLER_CLASS` environment variable to `SilverStripe\Control\SessionHandler\CacheSessionHandler`

```yml
SilverStripe\Control\Session:
  save_handler: 'SilverStripe\Control\SessionHandler\CacheSessionHandler'
```

> [!NOTE]
> Although this is using a cache, sessions won't be cleared when flushing the site.

You can define the factory which is used to instantiate the cache by setting the `SS_SESSION_CACHE_FACTORY` environment variable, or by setting the following YAML configuration:

```yml
---
After: '#session-handlers'
---
SilverStripe\Core\Injector\Injector:
  Psr\SimpleCache\CacheInterface.session-handler:
    factory: 'App\Session\MyCacheFactory'
```

For example to use Memcached, you can use the [`MemcachedCacheFactory`](api:SilverStripe\Core\Cache\MemcachedCacheFactory) cache factory.

See [cache adapters](/developer_guides/performance/cache_adapters/) for any additional details required to use those cache factories, though note that you do not need to set `SS_IN_MEMORY_CACHE_FACTORY` to set up the session save handler.

#### `DatabaseSessionHandler`

The [`DatabaseSessionHandler`](api:SilverStripe\Control\SessionHandler\DatabaseSessionHandler) class lets you store session data in the database.

This provides a low barrier to sharing your sessions across multiple servers, e.g. in a horizontally-scaled hosting scenario.

Set this save handler with the following YAML configuration, or by setting the `SS_SESSION_SAVE_HANDLER_CLASS` environment variable to `SilverStripe\Control\SessionHandler\DatabaseSessionHandler`

```yml
SilverStripe\Control\Session:
  save_handler: 'SilverStripe\Control\SessionHandler\DatabaseSessionHandler'
```

You can change the name of the table used by setting [`DatabaseSessionHandler.table_name`](api:SilverStripe\Control\SessionHandler\DatabaseSessionHandler->table_name) to the new table name.

> [!WARNING]
> Changing the table name after sessions have already been stored in the old table will result in those sessions being invalidated, unless you manually migrate them to the new table.

### Cookies

#### Samesite attribute

The session cookie is handled slightly differently than most cookies on the site, which provides the opportunity to handle the samesite attribute separately from other cookies. By default, it is set to `Strict` to prevent cross-site attacks.

While it's generally not recommended, if you need to change this value for a particular reason then it can be changed via YAML:

```yml
SilverStripe\Control\Session:
  cookie_samesite: 'Lax'
```

You may also need to update the cookie responsible for remembering logins across sessions:

```yml
SilverStripe\Core\Injector\Injector:
  SilverStripe\Security\MemberAuthenticator\CookieAuthenticationHandler:
    properties:
      TokenCookieSameSite: 'Lax'
```

#### Secure session cookie

The session cookie settings vary slightly between `HTTP` and `HTTPS` connections. `HTTPS` connections automatically include the `Secure` attribute. This ensures that secure session cookie data is only transmitted over encrypted `HTTPS` connections, preventing it from being exposed during plain-text `HTTP` requests and enhancing overall security. This means that if you are serving your site over both `HTTPS` and `HTTP`, some functionality such as authentication may not work as expected.

Like the samesite attribute, while it's not generally recommended a secure session cookie can be disabled via YAML:

```yml
SilverStripe\Control\Session:
  cookie_secure: false
```

You may also need to update the cookie responsible for remembering logins across sessions:

```yml
SilverStripe\Core\Injector\Injector:
  SilverStripe\Security\MemberAuthenticator\CookieAuthenticationHandler:
    properties:
      TokenCookieSecure: false
```

Note that if you set `cookie_samesite` to `None` (which is *strongly* discouraged), the `cookie_secure` value will *always* be `true`.

### Relaxing checks around user agent strings

Out of the box, Silverstripe CMS will invalidate a user's session if the `User-Agent` header changes. This provides some supplemental protection against session high-jacking attacks.

It is possible to disable the user agent header session validation. However, it is not recommended.

To disable the user agent session check, add the following code snippet to your project's YAML configuration.

```yml
SilverStripe\Control\Session:
  strict_user_agent_check: false
```

## API documentation

- [Session](api:SilverStripe\Control\Session)
