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
$this->redirect($this->Link('goherenow'));
// redirect to Page::goherenow(), i.e on the contact-us page this will redirect to /contact-us/goherenow/

$this->redirect('/goherenow');
// redirect to the URL on www.example.com/goherenow/ assuming your website is hosted at www.example.com (note the leading slash)

$this->redirect('https://www.example.com');
// redirect to https://www.example.com (assuming that is an external website URL)

$this->redirectBack();
// go back to the previous page.
```

## Status Codes

The `redirect()` method takes an optional HTTP status code, either `301` for permanent redirects, or `302` for 
temporary redirects (default).

```php
$this->redirect('/', 302);
// go back to the homepage, don't cache that this page has moved
```

## Redirection in URL Handling

Controllers can specify redirections in the `$url_handlers` property rather than defining a method by using the '~'
operator.

```php
private static $url_handlers = [
    'players/john' => '~>coach'
];
```

For more information on `$url_handlers` see the [Routing](routing) documentation.

## API Documentation

* [Controller](api:SilverStripe\Control\Controller)
