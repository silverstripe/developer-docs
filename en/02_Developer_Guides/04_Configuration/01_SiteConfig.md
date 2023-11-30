---
title: SiteConfig
summary: Content author configuration through the SiteConfig module.
icon: laptop-code
---

# SiteConfig

The `silverstripe/siteconfig` module provides a generic interface for managing site-wide settings or functionality which is used
throughout the site. Out of the box, this includes setting the site name and site-wide access.

## Accessing variables

`SiteConfig` options can be accessed from any template by using the `$SiteConfig` variable.

```ss
$SiteConfig.Title
$SiteConfig.Tagline

<% with $SiteConfig %>
    $Title $AnotherField
<% end_with %>
```

To access variables in the PHP:

```php
use Silverstripe\SiteConfig\SiteConfig;

$config = SiteConfig::current_site_config();

// prints "Website Name"
echo $config->Title;
```

## Extending `SiteConfig`

To extend the options available in the panel, define your own fields via an [`Extension`](api:SilverStripe\Core\Extension).

```php
// app/src/Extension/CustomSiteConfig.php
namespace App\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;

class CustomSiteConfig extends Extension
{
    private static $db = [
        'FooterContent' => 'HTMLText',
    ];

    public function updateCMSFields(FieldList $fields)
    {
        $fields->addFieldToTab('Root.Main', HTMLEditorField::create('FooterContent', 'Footer Content'));
    }
}
```

Then apply the extension.

```yml
# app/_config/extensions.yml
Silverstripe\SiteConfig\SiteConfig:
  extensions:
    - App\Extension\CustomSiteConfig
```

[notice]
After adding the class and the YAML change, make sure to rebuild your database by visiting `https://www.example.com/dev/build`.
You may also need to reload the screen with a `?flush=1` i.e.`https://www.example.com/admin/settings?flush=1`.
[/notice]

You can define as many extensions for `SiteConfig` as you need. For example, if you're developing a module and want to
provide the users a place to configure site-wide settings then the `SiteConfig` panel is the place to go it.

## API documentation

- [SiteConfig](api:SilverStripe\SiteConfig\SiteConfig)

## Related lessons

- [DataExtensions and SiteConfig](https://www.silverstripe.org/learn/lessons/v4/data-extensions-and-siteconfig-1)
