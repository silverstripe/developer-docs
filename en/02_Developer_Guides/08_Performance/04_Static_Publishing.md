---
title: Static Publishing
summary: Export web pages as static HTML
---

# Static publishing

Static publishing is the process of exporting website pages as static HTML files which are then served directly. This means that page content does not need to be recomputed on each request. This can have the following benefits:

- Faster load times: Static HTML files load much faster than dynamically generated pages.
- Reduced server load: No database connection or template rendering is required for each request.
- Lower hosting costs: Less server resources are needed to serve statically cached content.

By publishing the page as HTML it's possible to run Silverstripe CMS from behind a corporate firewall, on a low performance server and a large amount of traffic without expensive hardware.

> [!WARNING]
> Static publishing is more complex than regenerating page content every request because it requires a separate process to generate and manage the static files. Also, if static publishing happens on demand (i.e. on page save/publish) rather than on a queue, then speed of CMS operations may degrade.

Static publishing is available through the [silverstripe/staticpublishqueue](https://github.com/silverstripe/silverstripe-staticpublishqueue) module.

> [!NOTE]
> If you want to cache part of a page, or your site has interactive elements such as forms, then [Partial template caching](partial_template_caching) is more suitable.
> Partial template caching can also be used on pages that are intended to be statically generated to speed up the re-building of the HTML.

## Handling dynamic data

Static publishing is most suitable for website content that changes infrequently and does not require dynamic interactions on every page load. Any dynamic elements will need to be separately considered.

Any pages that use templates rather than AJAX requests, and contain any dynamic data or form data should be excluded from static generation. Forms that rely on templates will be reloaded on submission and any validation errors will be included in the response.

For larger sites, rendering navigation menus on every page, particularly large "mega-menus" with nested pages can be challenging on statically generated websites. This is because adding or removing a page, or changing a page's navigation title means that the static file for every page on the site needs to be regenerated.

This can be worked around by rendering the menu HTML, or JSON with the menu data with a separate endpoint. The return value of the endpoint can be cached using [object caching](object_caching). The frontend can then request and construct the menu using an AJAX request.

Likewise, dynamic content such as displaying personalised data for logged-in users can be shown on statically generated pages by loading that data via AJAX from an endpoint and using AJAX to submit data back to the server. With this sort of content you probably will not want to use object caching.
