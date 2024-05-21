---
title: Members
summary: Learn how logged in users are managed in Silverstripe CMS
icon: user
---

# Member

## Introduction

The [Member](api:SilverStripe\Security\Member) class is used to represent user accounts on a Silverstripe CMS site (including newsletter recipients).

## Testing for logged in users

The [Security](api:SilverStripe\Security\Security) class comes with a static method for getting information about the current logged in user.

`Security::getCurrentUser()` retrieves the current logged in member.  Returns `null` if user is not logged in, otherwise, the `Member` object is returned.

```php
use SilverStripe\Security\Security;

$member = Security::getCurrentUser()
if ($member) {
    // Work with $member
} else {
    // Do non-member stuff
}
```

## Subclassing

> [!WARNING]
> This is the least desirable way of extending the [Member](api:SilverStripe\Security\Member) class. It's better to use [DataExtension](api:SilverStripe\ORM\DataExtension)
> (see below).

You can define subclasses of [Member](api:SilverStripe\Security\Member) to add extra fields or functionality to the built-in membership system.

```php
namespace App\Security;

use SilverStripe\Security\Member;

class MyMember extends Member
{
    private static $db = [
        'Age' => 'Int',
        'Address' => 'Text',
    ];
}
```

To ensure that all new members are created using this class, put a call to [`Injector`](api:SilverStripe\Core\Injector\Injector) in
`(project)/_config/_config.yml`:

```yml
SilverStripe\Core\Injector\Injector:
  SilverStripe\Security\Member:
    class: App\Security\MyMemberClass
```

Note that if you want to look this class-name up, you can call `Injector::inst()->get('Member')->ClassName`

## Overriding getCMSFields()

If you override the built-in public function getCMSFields(), then you can change the form that is used to view & edit member
details in the newsletter system.  This function returns a [FieldList](api:SilverStripe\Forms\FieldList) object.  You should generally start by calling
parent::getCMSFields() and manipulate the [FieldList](api:SilverStripe\Forms\FieldList) from there.

```php
namespace App\Security;

use SilverStripe\Forms\TextField;
use SilverStripe\Security\Member;

class MyMember extends Member
{
    // ...

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $fields->insertBefore('HTMLEmail', TextField::create('Age'));
        $fields->removeByName('JobTitle');
        $fields->removeByName('Organisation');
        return $fields;
    }
}
```

## Extending `Member` or `DataObject`

Basic rule: Class [`Member`](api:SilverStripe\Security\Member) should just be extended for entities who have some kind of login.
If you have different types of [`Member`](api:SilverStripe\Security\Member)s in the system, you have to make sure that those with login-capabilities a unique field to be used for the login.
For persons without login-capabilities (e.g. for an address-database), you shouldn't extend [`Member`](api:SilverStripe\Security\Member) to avoid conflicts
with the `Member` database table. This enables us to have a different subclass of [`Member`](api:SilverStripe\Security\Member) for an email-address with login-data,
and another subclass for the same email-address in the address-database.

## `Member` role extension

Using inheritance to add extra behaviour or data fields to a member is limiting, because you can only inherit from 1
class. A better way is to use role extensions to add this behaviour. Add the following to your
[`config.yml`](/developer_guides/configuration/configuration/#configuration-yaml-syntax-and-rules).

```yml
SilverStripe\Security\Member:
  extensions:
    - App\Extension\MyMemberExtension
```

A role extension is simply a subclass of [`DataExtension`](api:SilverStripe\ORM\DataExtension) that is designed to be used to add behaviour to [`Member`](api:SilverStripe\Security\Member).
The roles affect the entire class - all members will get the additional behaviour.  However, if you want to restrict
things, you should add appropriate [`Permission::checkMember()`](api:SilverStripe\Security\Permission::checkMember()) calls to the role's methods.

```php
namespace App\Extension;

use SilverStripe\Form\FieldList;
use SilverStripe\ORM\DataExtension;
use SilverStripe\Security\Permission;

class MyMemberExtension extends DataExtension
{
    // define additional properties
    private static $db = [
        'MyNewField' => 'Text',
    ];

    /**
    * Modify the field set to be displayed in the CMS detail pop-up
    */
    protected function updateCMSFields(FieldList $currentFields)
    {
        // Only show the additional fields on an appropriate kind of use
        if (Permission::checkMember($this->owner->ID, 'VIEW_FORUM')) {
            // Edit the FieldList passed, adding or removing fields as necessary
        }
    }

    public function somethingElse()
    {
        // You can add any other methods you like, which you can call directly on the member object.
    }
}
```

## Saved user logins

Logins can be "remembered" across multiple devices when user checks the "Remember Me" box. By default, a new login token
will be created and associated with the device used during authentication. When user logs out, all previously saved tokens
for all devices will be revoked, unless [`RememberLoginHash::$logout_across_devices`](api:SilverStripe\Security\RememberLoginHash::$logout_across_devices) is set to false. For extra security,
single tokens can be enforced by setting [`RememberLoginHash::$force_single_token`](api:SilverStripe\Security\RememberLoginHash::$force_single_token) to true.  Tokens will be valid for 30 days by
default and this can be modified via [`RememberLoginHash::$token_expiry_days`](api:SilverStripe\Security\RememberLoginHash::$token_expiry_days).

## Acting as another user

Occasionally, it may be necessary not only to check permissions of a particular member, but also to
temporarily assume the identity of another user for certain tasks. For example when running a CLI task,
it may be necessary to log in as an administrator to perform write operations.

You can use `Member::actAs()` method, which takes a member or member id to act as, and a callback
within which the current user will be assigned the given member. After this method returns
the current state will be restored to whichever current user (if any) was logged in.

If you pass in null as a first argument, you can also mock being logged out, without modifying
the current user.

Note: Take care not to invoke this method to perform any operation the current user should not
reasonably be expected to be allowed to do.

For example:

```php
namespace App\Task;

use App\Model\DataRecord;
use BadMethodCallException;
use SilverStripe\Control\Director;
use SilverStripe\Dev\BuildTask;
use SilverStripe\Security\Member;
use SilverStripe\Security\Security;

class CleanRecordsTask extends BuildTask
{
    public function run($request)
    {
        if (!Director::is_cli()) {
            throw new BadMethodCallException('This task only runs on CLI');
        }
        $admin = Security::findAnAdministrator();
        Member::actAs($admin, function () {
            DataRecord::get()->filter('Dirty', true)->removeAll();
        });
    }
}
```

## API documentation

[Member](api:SilverStripe\Security\Member)
