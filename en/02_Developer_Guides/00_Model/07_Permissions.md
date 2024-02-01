---
title: Model-Level Permissions
summary: Reduce risk by securing models.
icon: lock
---

# Model-Level permissions

Models can be modified in a variety of controllers and user interfaces, all of which can implement their own security
checks. Often it makes sense to centralize those checks on the model, regardless of the used controller.

The API provides four methods for this purpose: `canEdit()`, `canCreate()`, `canView()` and `canDelete()`.

> [!TIP]
> Versioned models have additional permission methods - see [Version specific `can` methods](versioning#permission-methods).

Since they're PHP methods, they can contain arbitrary logic matching your own requirements. They can optionally receive
a `$member` argument, and default to the currently logged in member (through `Security::getCurrentUser()`).

> [!WARNING]
> By default, all `DataObject` subclasses can only be edited, created and viewed by users with the 'ADMIN' permission code.
> Make sure you implement these methods for models which should be editable by members with more restrictive permission models.

In this example, the `MyDataObject` model can be viewed, edited, deleted, and created by any user with the `CMS_ACCESS_CMSMain` permission code, aka "Access to 'Pages' section".

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Permission;

class MyDataObject extends DataObject
{
    public function canView($member = null)
    {
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }

    public function canEdit($member = null)
    {
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }

    public function canDelete($member = null)
    {
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }

    public function canCreate($member = null, $context = [])
    {
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }
}
```

It is good practice to let extensions extend permissions unless you *explicitly* want a very restrictive permissions model. This is already done by default in the implementations of these methods in `DataObject`.

You might also want to validate that the parent class doesn't deny access for a given action.

```php
namespace App\Model\MyDataObject;

use SilverStripe\Security\Permission;

class MyDataObject extends SomeParentObject
{
    public function canView($member = null)
    {
        // If any extension returns false, the result will be false
        // otherwise if any extension returns true, the result will be true
        $extended = $this->extendedCan(__FUNCTION__, $member);
        // The line below is checking that there is any value other than null, but depending on your
        // use case you may want to explicitly check for a `false` value instead, and ignore any true values,
        // e.g. if you don't want extensions saying members CAN perform this action before you've done your own checks.
        if ($extended !== null) {
            return $extended;
        }

        // If no extensions return true or false, check for a specific permission here.
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }

    public function canEdit($member = null)
    {
        // If the parent class says the member can't perform this action, don't let them do it.
        // Be careful though - if the parent class doesn't explicitly implement canEdit(), you will end up
        // only allowing ADMIN's access by calling the implementation in the DataObject class.
        if (!parent::canEdit($member)) {
            return false;
        }

        // If the parent object doesn't say the member can't perform the action, do our own checks.
        return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }
}
```

See the [User Permissions](/developer_guides/security/permissions/) section for more information about defining permissions.

> [!CAUTION]
> These checks are not enforced on low-level ORM operations such as `write()` or `delete()`, but rather rely on being
> checked in the invoking code. The CMS default sections as well as custom interfaces like [`ModelAdmin`](api:SilverStripe\Admin\ModelAdmin) or
> [`GridField`](api:SilverStripe\Forms\GridField\GridField) already enforce these permissions.

## Defining permissions in extensions

You can extend the permissions checks for and `DataObject` by implementing an [`Extension`](api:SilverStripe\Core\Extension).

It is good practice to only return `null` or `false` from these methods. Returning `false` means the user is *not* allowed to perform the action, and `null` means the record should perform the rest of its own permission checks to validate if the user can perform the action.

If you return `true` from these methods, you're saying the user *is* allowed to perform the action, and that the model shouldn't perform any more permissions checks.

```php
namespace App\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Security\Permission;

class PermissionsExtension extends Extension
{
    public function canView()
    {
        if (!Permission::check('CMS_ACCESS_CMSMain', 'any', $member)) {
            return false;
        }
        return null;
    }
}
```

See [Extensions and DataExtensions](/developer_guides/extending/extensions/) for more information about extensions.

## API documentation

- [DataObject](api:SilverStripe\ORM\DataObject)
- [Permission](api:SilverStripe\Security\Permission)
