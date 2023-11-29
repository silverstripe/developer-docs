---
title: Redirection
summary: Move users around your site using automatic redirection.
icon: reply
---

# Redirection

Controllers can facilitate redirecting users from one place to another using `HTTP` redirection using the `Location`
HTTP header.

```php
namespace App\Control;

use SilverStripe\Control\Controller;
use SilverStripe\Control\HTTPResponse;

class MyController extends Controller
{
    // ...

    public function someMethod(): HTTPResponse
    {
        // redirect to the "goherenow" action on this controller, i.e. on the controller for the "contact-us" page this
        // will redirect to /contact-us/goherenow/
        return $this->redirect($this->Link('goherenow'));

        // redirect to the URL on yoursite.com/goherenow/ (note the leading slash)
        return $this->redirect('/goherenow');

        // redirect to https://google.com
        return $this->redirect('https://google.com');

        // go back to the previous page
        return $this->redirectBack();
    }
}
```

## Status codes

The `redirect()` method takes an optional HTTP status code, either `301` for permanent redirects, or `302` for
temporary redirects (default).

```php
// go back to the homepage, don't cache that this page has moved
$this->redirect('/', 302);
```

## Redirection in URL handling

Controllers can specify redirections in the `$url_handlers` property rather than defining a method by using the '~'
operator.

```php
namespace App\Control;

use SilverStripe\Control\Controller;

class MyController extends Controller
{
    private static $url_handlers = [
        'players/john' => '~>coach',
    ];
    // ...
}
```

For more information on `$url_handlers` see the [Routing](routing) documentation.

## API documentation

- [Controller](api:SilverStripe\Control\Controller)
