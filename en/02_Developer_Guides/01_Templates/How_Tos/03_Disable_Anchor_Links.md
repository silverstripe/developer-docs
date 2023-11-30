---
title: Disable Anchor Rewriting
summary: Get more control over how hash links are rendered.
---

# Disable anchor rewriting

Anchor links are links with a "#" in them. A frequent use-case is to use anchor links to point to different sections of
the current page.  For example, we might have this in our template:

```ss
<ul>
    <li><a href="#section1">Section 1</a></li>
    <li><a href="#section2">Section 2</a></li>
</ul>
```

Things get tricky because (assuming you use `<% base_tag %>` in your template - see [common variables](../common_variables/#base-tag)) we have set our `<base>` tag to point to the root of the site. So, when you click the
first link you will be sent to `https://www.example.com/#section1` instead of `https://www.example.com/my-long-page/#section1`

In order to prevent this situation, the SSViewer template renderer will automatically rewrite any anchor link that
doesn't specify a URL before the anchor, prefixing the URL of the current page.  For our example above, the following
would be created in the final HTML

```ss
<ul>
    <li><a href="my-long-page/#section1">Section 1</a></li>
    <li><a href="my-long-page/#section2">Section 2</a></li>
</ul>
```

There are cases where this can be unhelpful, for example when HTML anchors are created from Ajax responses, or you are using a JavaScript framework in the frontend that uses hash links as part of its functionality. In these
situations, you can disable anchor link rewriting by setting the `SSViewer.rewrite_hash_links` configuration value to
`false`.

```yml
# app/_config/config.yml
SilverStripe\View\SSViewer:
  rewrite_hash_links: false
```

Alternatively, it's possible to disable anchor link rewriting for specific controllers and routes using the `SSViewer::setRewriteHashLinksDefault()` method in the controller:

```php
namespace App\PageType;

use PageController;
use SilverStripe\View\SSViewer;

class ExamplePageController extends PageController
{
    protected function init()
    {
        parent::init();
        SSViewer::setRewriteHashLinksDefault(false);
    }
}
```
