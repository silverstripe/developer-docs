---
title: Extensions
summary: Extensions and DataExtensions let you modify and augment objects transparently.
icon: code
---

# `Extension` and `DataExtension`

An [Extension](api:SilverStripe\Core\Extension) allows for adding additional functionality to a class or modifying existing functionality
without the hassle of creating a subclass. Developers can add Extensions to any PHP class that has the [Extensible](api:SilverStripe\Core\Extensible)
trait applied within core, modules or even their own code to make it more reusable.

Extensions are defined as subclasses of either [DataExtension](api:SilverStripe\ORM\DataExtension) for extending a [DataObject](api:SilverStripe\ORM\DataObject) subclass or
the [Extension](api:SilverStripe\Core\Extension) class for non DataObject subclasses (such as [Controller](api:SilverStripe\Control\Controller))

> [!NOTE]
> For performance reasons a few classes are excluded from receiving extensions, including `ViewableData`
> and `RequestHandler`. You can still apply extensions to descendants of these classes.

```php
// app/src/Extension/MyMemberExtension.php
namespace App\Extension;

use SilverStripe\ORM\DataExtension;

class MyMemberExtension extends DataExtension
{
    private static $db = [
        'DateOfBirth' => 'DBDatetime',
    ];

    public function getGreeting()
    {
        // $this->owner refers to the original instance. In this case a `Member`.
        return 'Hi ' . $this->owner->Name;
    }
}
```

> [!NOTE]
> Convention is for extension class names to end in `Extension`. This isn't a requirement but makes it clearer

After this class has been created, it does not yet apply it to any object. We need to tell Silverstripe CMS what classes
we want to add the `MyMemberExtension` too. To activate this extension, add the following via the [Configuration API](../configuration).

```yml
# app/_config/extensions.yml
SilverStripe\Security\Member:
  extensions:
    - App\Extension\MyMemberExtension
```

Alternatively, we can add extensions through PHP code (in the `_config.php` file).

```php
use App\Extension\MyMemberExtension;
use SilverStripe\Security\Member;

Member::add_extension(MyMemberExtension::class);
```

This class now defines a `MyMemberExtension` that applies to all `Member` instances on the website. It will have
transformed the original `Member` class in two ways:

- Added a new [DBDatetime](api:SilverStripe\ORM\FieldType\DBDatetime) for the users date of birth, and;
- Added a `getGreeting` method to output `Hi <User>`

From within the extension we can add more functions, database fields, relations or other properties and have them added
to the underlying `DataObject` just as if they were added to the original `Member` class but without the need to edit
that file directly.

## Adding database fields

Extra database fields can be added with a extension in the same manner as if they were placed on the `DataObject` class
they're applied to. These will be added to the table of the base object - the extension will actually edit the `$db`,
`$has_one` etc.

```php
// app/src/Extension/MyMemberExtension.php
namespace App\Extension;

use SilverStripe\ORM\DataExtension;

class MyMemberExtension extends DataExtension
{
    private static $db = [
        'Position' => 'Varchar',
    ];

    private static $has_one = [
        'Image' => Image::class,
    ];
}
```

```ss
<%-- app/templates/Page.ss --%>
$CurrentMember.Position
$CurrentMember.Image
```

## Adding methods

Methods that have a unique name will be called as part of the `__call` method on [Object](api:Object). In this example
we added a `getGreeting` method which is unique to our extension.

```php
// app/src/Extension/MyMemberExtension.php
namespace App\Extension;

use SilverStripe\ORM\DataExtension;

class MyMemberExtension extends DataExtension
{
    public function getGreeting()
    {
        // $this->owner refers to the original instance. In this case a `Member`.
        return 'Hi ' . $this->owner->Name;
    }
}
```

```ss
<%-- app/templates/Page.ss --%>
<p>$CurrentMember.Greeting</p>
<%-- "Hi Sam" --%>
```

## Modifying existing methods

If the `Extension` needs to modify an existing method it's a little trickier. It requires that the method you want to
customise has provided an *Extension Hook* in the place where you want to modify the data. An *Extension Hook* is done
through the `extend()` method of the [Extensible](api:SilverStripe\Core\Extensible) trait.

```php
// silverstripe/framework/src/Security/Member.php
namespace SilverStripe\Security;

use SilverStripe\ORM\DataObject;
// ...

class Member extends DataObject
{
    // ...
    public function getValidator()
    {
        // ...
        $this->extend('updateValidator', $validator);
        // ...
    }
    // ...
}
```

Extension Hooks can be located anywhere in the method and provide a point for any `Extension` instances to modify the
variables at that given point. In this case, the core function `getValidator` on the `Member` class provides an
`updateValidator` hook for developers to modify the core method. The `MyMemberExtension` would modify the core member's
validator by defining the `updateValidator` method.

```php
// app/src/Extension/MyMemberExtension.php
namespace App\Extension;

use SilverStripe\ORM\DataExtension;

class MyMemberExtension extends DataExtension
{
    public function updateValidator($validator)
    {
        // we want to make date of birth required for each member
        $validator->addRequiredField('DateOfBirth');
    }
}
```

> [!NOTE]
> The `$validator` parameter is passed by reference, as it is an object.

Another common example of when you will want to modify a method is to update the default CMS fields for an object in an
extension. The `CMS` provides a `updateCMSFields` Extension Hook to tie into.

```php
namespace App\Extension;

use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataExtension;

class MyMemberExtension extends DataExtension
{
    private static $db = [
        'Position' => 'Varchar',
    ];

    private static $has_one = [
        'Image' => 'Image',
    ];

    public function updateCMSFields(FieldList $fields)
    {
        $fields->push(TextField::create('Position'));
        $fields->push($upload = UploadField::create('Image', 'Profile Image'));
        $upload->setAllowedFileCategories('image/supported');
    }
}
```

> [!WARNING]
> If you're providing a module or working on code that may need to be extended by  other code, it should provide a *hook*
> which allows an Extension to modify the results.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyModel extends DataObject
{
    // ...

    public function getFoo()
    {
        $foo = '';

        $this->extend('updateFoo', $foo);

        return $foo;
    }
}
```

The convention for extension hooks is to provide an `update{$FunctionOrProperty}` hook at the end before you return the result. If
you need to provide extension hooks at the beginning of the method use `before{..}`.

## Owner

In your [Extension](api:SilverStripe\Core\Extension) class you can only refer to the source object through the `owner` property on the class as
`$this` will refer to your `Extension` instance.

```php
namespace App\Extension;

use SilverStripe\ORM\DataExtension;

class MyMemberExtension extends DataExtension
{
    public function updateFoo($foo)
    {
        // outputs the original class
        var_dump($this->owner);
    }
}
```

> [!WARNING]
> Please note that while you can read protected properties of the source object (using `$this->owner->protectedProperty`) you cannot call any of it's protected methods (`$this->owner->protectedMethod()` will not work). You also cannot access any of the source object's private properties or methods (`$this->owner->privateProperty` will not work either).

## Checking to see if an object has an extension

To see what extensions are currently enabled on an object, use the [getExtensionInstances()](api:SilverStripe\Core\Extensible::getExtensionInstances()) and
[hasExtension()](api:SilverStripe\Core\Extensible::hasExtension()) methods of the [Extensible](api:SilverStripe\Core\Extensible) trait.

```php
$member = Security::getCurrentUser();

print_r($member->getExtensionInstances());

if ($member->hasExtension(MyCustomMemberExtension::class)) {
    // ...
}
```

## Extension injection points

`Extensible` has two additional methods, `beforeExtending` and `afterExtending`, each of which takes a method name and a
callback to be executed immediately before and after `extend()` is called on extensions.

This is useful in many cases where working with modules such as `Translatable` which operate on `DataObject` fields
that must exist in the `FieldList` at the time that `$this->extend('UpdateCMSFields')` is called.

> [!WARNING]
> Please note that each callback is only ever called once, and then cleared, so multiple extensions to the same function
> require that a callback is registered each time, if necessary.

Example: A class that wants to control default values during object  initialization. The code needs to assign a value
if not specified in `self::$defaults`, but before extensions have been called:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyModel extends DataObject
{
    private static $db = [
        'MyField' => 'Text',
    ];

    public function __construct()
    {
        $this->beforeExtending('populateDefaults', function () {
            if (empty($this->MyField)) {
                $this->MyField = 'Value we want as a default if not specified in $defaults, but set before extensions';
            }
        });

        parent::__construct();
    }
}
```

Example 2: User code can intervene in the process of extending CMS fields.

> [!WARNING]
> This method is preferred to disabling, enabling, and calling field extensions manually.

```php
namespace App\Model;

use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataObject;

class MyModel extends DataObject
{
    // ...

    public function getCMSFields()
    {
        $this->beforeUpdateCMSFields(function ($fields) {
            // Include field which must be present when updateCMSFields is called on extensions
            $fields->addFieldToTab('Root.Main', TextField::create('Detail', 'Details', null, 255));
        });

        $fields = parent::getCMSFields();
        // ... additional fields here
        return $fields;
    }
}
```

## Extending extensions {#extendingextensions}

Extension classes can be overloaded using the Injector, if you want to modify the way that an extension in one of
your modules works:

```yml
SilverStripe\Core\Injector\Injector:
  Company\Vendor\SomeExtension:
    class: App\Extension\CustomisedSomeExtension
```

```php
// app/src/Extension/CustomisedSomeExtension.php
namespace App\Extension;

use Company\Vendor\SomeExtension;

class CustomisedSomeExtension extends SomeExtension
{
    public function someMethod()
    {
        $result = parent::someMethod();
        // modify result;
        return $result;
    }
}
```

> [!WARNING]
> Please note that modifications such as this should be done in YAML configuration only. It is not recommended
> to use `Config::modify()->set()` to adjust the implementation class name of an extension after the configuration
> manifest has been loaded, and may not work consistently due to the "extra methods" cache having already been
> populated.

## Related lessons

- [DataExtensions and SiteConfig](https://www.silverstripe.org/learn/lessons/v4/data-extensions-and-siteconfig-1)

## Related documentation

- [Injector](injector/)

## API documentation

- [Extension](api:SilverStripe\Core\Extension)
- [DataExtension](api:SilverStripe\ORM\DataExtension)
