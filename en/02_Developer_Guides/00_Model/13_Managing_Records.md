---
title: Managing Records
summary: Manage your DataObject records
icon: list-alt
---

# Managing records

Most records in Silverstripe CMS are managed [in a GridField](../forms/field_types/gridfield) - whether in the [GridField](api:SilverStripe\Forms\GridField\GridField)
of some other record or directly [in a ModelAdmin](../customising_the_admin_interface/modeladmin/). The notable exceptions to this are
[SiteConfig](api:SilverStripe\SiteConfig\SiteConfig) and [SiteTree](api:SilverStripe\CMS\Model\SiteTree).

## Getting an edit link

As of Silverstripe CMS 4.12.0 there is a new [CMSEditLinkExtension](api:SilverStripe\Admin\CMSEditLinkExtension) specifically
for the purpose of generating links to the edit forms of records. It operates on the assumption that your record is being edited in
a [GridFieldDetailForm](../forms/field_types/gridfield#gridfielddetailform) in some `GridField` (be it on another record or in a
`ModelAdmin`).

When using this extension, your model must also declare its `cms_edit_owner` as a
[configuration property](../configuration/configuration/#configuration-properties). The value must either be the class name of the
`ModelAdmin` that directly manages the record, or the `has_one` relation for the record that this model is edited on, which is often the parent `DataObject`.

If the `cms_edit_owner` is a `has_one` relation, the class on the other end of the relation *must* have
a reciprocal `has_many` relation as documented in [Relations](./relations#has-many). For best results, use dot notation on the
`has_many` relation. It must also implement a [getCMSEditLinkForManagedDataObject()](api:SilverStripe\Admin\CMSEditLinkExtension::getCMSEditLinkForManagedDataObject())
method. The easiest way to do that is for it to apply the `CMSEditLinkExtension` to the reciprocal class.

```php
// app/src/Model/MyModel.php
namespace App\Model;

use SilverStripe\Admin\CMSEditLinkExtension;
use SilverStripe\ORM\DataObject;

class MyModel extends DataObject
{
    private static string $cms_edit_owner = 'Parent';

    private static $has_one = [
        'Parent' => MyParentModel::class,
    ];

    private static $extensions = [
        CMSEditLinkExtension::class,
    ];
}
```

```php
// app/src/Model/MyParentModel.php
namespace App\Model;

use App\Admin\MyModelAdmin;
use SilverStripe\Admin\CMSEditLinkExtension;
use SilverStripe\ORM\DataObject;

class MyParentModel extends DataObject
{
    private static string $cms_edit_owner = MyModelAdmin::class;

    private static $has_many = [
        'Children' => MyModel::class,
    ];

    private static $extensions = [
        CMSEditLinkExtension::class,
    ];
}
```

[hint]
If the `cms_edit_owner` is in some vendor dependency that you don't control, you can always apply `CMSEditLinkExtension`
and the `cms_edit_owner` via YAML.
[/hint]

With the above code examples, you can call `CMSEditLink()` on any instance of `MyModel` or `MyParentModel` and it will produce
an appropriate edit link for that record (assuming the relations are set up). This can be used, for example, in email reminders
to update content, or as a link (available to admins) on the front-end to go straight to the edit form for the record.

It is also useful when [making a previewable `DataObject`](../customising_the_admin_interface/preview/), as `CMSEditLink()` is
one of the methods in the [CMSPreviewable](api:SilverStripe\ORM\CMSPreviewable) interface.

[info]
`SiteTree` already has `CMSEditLinkExtension` applied, which means any `cms_edit_owner` pointing to a `has_one` relation of
a `SiteTree` will work, assuming the page has a `GridField` for its reciprocal `has_many` relation with a `GridFieldDetailForm`
in it.
[/info]
