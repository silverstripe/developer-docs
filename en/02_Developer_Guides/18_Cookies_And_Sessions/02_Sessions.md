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

## Cookies

### Samesite attribute

The session cookie is handled slightly differently than most cookies on the site, which provides the opportunity to handle the samesite attribute separately from other cookies.
You can change the `samesite` attribute for session cookies like so:

```yml
SilverStripe\Control\Session:
  cookie_samesite: 'Strict'
```

### Secure session cookie

In certain circumstances, you may want to use a different `session_name` cookie when using the `https` protocol for security purposes. To do this, you may set the `cookie_secure` parameter to `true` on your `config.yml`

```yml
SilverStripe\Control\Session:
  cookie_secure: true
```

This uses the session_name `SECSESSID` for `https` connections instead of the default `PHPSESSID`. Doing so adds an extra layer of security to your session cookie since you no longer share `http` and `https` sessions.

Note that if you set `cookie_samesite` to `None` (which is *strongly* discouraged), the `cookie_secure` value will *always* be `true`.

## Relaxing checks around user agent strings

Out of the box, Silverstripe CMS will invalidate a user's session if the `User-Agent` header changes. This provides some supplemental protection against session high-jacking attacks.

It is possible to disable the user agent header session validation. However, it is not recommended.

To disable the user agent session check, add the following code snippet to your project's YAML configuration.

```yml
SilverStripe\Control\Session:
  strict_user_agent_check: false
```

## API documentation

- [Session](api:SilverStripe\Control\Session)
