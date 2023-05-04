---
title: Redirection
summary: Move users around your site using automatic redirection.
icon: reply
---

# Redirection

Controllers can facilitate redirecting users from one place to another using `HTTP` redirection using the `Location` 
HTTP header.

**app/src/Page.php**

```php
// redirect to Page::goherenow(), i.e on the contact-us page this will redirect to /contact-us/goherenow/
$this->redirect($this->Link('goherenow'));

// redirect to the URL on www.example.com/goherenow/ assuming your website is hosted at www.example.com (note the leading slash)
$this->redirect('/goherenow');

// redirect to https://www.example.com (assuming that is an external website URL)
$this->redirect('https://www.example.com');

// go back to the previous page.
$this->redirectBack();
```

## Back URL

The `BackURL` get parameter is one mechanism the [`redirectBack()`](api:SilverStripe\Control\RequestHandler::redirectBack()) method uses to know where to redirect to. It also checks for a legacy `X-Backurl` header and a `referer` header, and failing that just redirects to the base URL for your website.

You can use the `BackURL` parameter if you want an action to redirect users to some specific path. You might want to do this for example to force unauthenticated users to log in before performing an action.

```php
use SilverStripe\Control\Controller;
use SilverStripe\Security\Security;

$args = ['BackURL' => $this->Link('someAction')];
$this->redirect(Controller::join_links(Security::login_url(), '?' . http_build_query($args)));
```

If there's already a `BackURL` parameter in the current request's URL, you can add that directly to any link:

```php
$linkWithBackURL = $this->addBackURLParam($this->Link('someAction'));
```

## Status Codes

The `redirect()` method takes an optional HTTP status code, either `301` for permanent redirects, or `302` for 
temporary redirects (default).

```php
// go back to the homepage, don't cache that this page has moved
$this->redirect('/', 302);
```

## Redirections in routing rules

You can define redirections in the director routing rules. There are two ways to declare redirections in routing rules.

If the routing rule pattern starts with `->`, it will be interpreted as a redirect.

```yml
SilverStripe\Control\Director:
  rules:
    'about': '->about-us'
```

You can also explicitly declare the rule as a redirection using the following more explicit syntax, which can be a useful way to better visually distinguish redirection routes from controller routes.

```yml
SilverStripe\Control\Director:
  rules:
    'about':
      Redirect: 'about-us'
```

The path to redirect to will be interpreted as being relative to your site root unless you explicitly set a protocol or prefix the URL with `//` like so:

```yml
SilverStripe\Control\Director:
  rules:
    'absolute-url1': '->//www.example.com'
    'absolute-url2': '->https://www.example.com'
```

For more information about routing rules see the [Routing](routing) documentation.

## API Documentation

* [Controller](api:SilverStripe\Control\Controller)
