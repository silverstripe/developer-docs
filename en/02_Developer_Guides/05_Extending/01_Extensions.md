---
title: Extensions
summary: Extensions let you modify and augment objects transparently.
icon: code
---

# `Extension`

An [Extension](api:SilverStripe\Core\Extension) allows for adding additional functionality to a class or modifying existing functionality
without the hassle of creating a subclass. Developers can add Extensions to any PHP class that has the [Extensible](api:SilverStripe\Core\Extensible)
trait applied within core, modules or even their own code to make it more reusable.

Extensions are defined as subclasses of the [`Extension`](api:SilverStripe\Core\Extension) class.
Typically, subclasses of the [`Extension`](api:SilverStripe\Core\Extension) class are used for extending a [`DataObject`](api:SilverStripe\ORM\DataObject) subclass.

> [!NOTE]
> For performance reasons a few classes are excluded from receiving extensions, including `ViewableData`
> and `RequestHandler`. You can still apply extensions to descendants of these classes.

```php
// app/src/Extension/MyMemberExtension.php
namespace App\Extension;

use SilverStripe\Core\Extension;

class MyMemberExtension extends Extension
{
    private static $db = [
        'DateOfBirth' => 'DBDatetime',
    ];

    public function getGreeting()
    {
        // $this->owner refers to the instance being extended - in this case a `Member` record.
        return "Hi {$this->owner->Name}";
    }
}
```

> [!NOTE]
> Convention is for extension class names to end in `Extension`. This isn't a requirement but makes it clearer

After this class has been created, it does not yet apply it to any object. We need to tell Silverstripe CMS what classes
we want to add the `MyMemberExtension` to. To activate this extension, add the following via the [Configuration API](../configuration).

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

- Added a new [`DBDatetime`](api:SilverStripe\ORM\FieldType\DBDatetime) database field for the user's date of birth, and;
- Added a public `getGreeting` method to output `Hi <User>`

From within the extension we can add more functions, database fields, relations or other properties and have them added
to the underlying `DataObject` just as if they were added to the original `Member` class but without the need to edit
that file directly.

## Owner

In your [`Extension`](api:SilverStripe\Core\Extension) class you can only refer to the source object through the `owner` property on the class as
`$this` will refer to your `Extension` instance.

```php
// app/src/Extension/MyMemberExtension.php
namespace App\Extension;

use SilverStripe\Core\Extension;

class MyMemberExtension extends Extension
{
    public function updateFoo($foo)
    {
        // outputs the class name of the object being extended
        var_dump(get_class($this->owner));
    }
}
```

## Adding configuration properties

Extension classes can add to configuration properties for the classes they extend. Any configuration property declared in an extension can be accessed both from the context of the extension class itself as well as from the context of the class being extended.

```php
namespace App\Data;

use SilverStripe\View\ViewableData;

class MyDataClass extends ViewableData
{
    private static array $my_configuration_property = [
        'key1' => 'value1',
        'key2' => 'value2',
    ];
}
```

```php
namespace App\Extension;

use SilverStripe\Core\Extension;

class MyDataClassConfigExtension extends Extension
{
    private static array $my_configuration_property = [
        'key1' => 'not overridden',
        'key3' => 'value3',
    ];

    private static bool $new_config_property = true;
}
```

```yml
App\Data\MyDataClass:
  extensions:
    - App\Extension\MyDataClassConfigExtension
```

With the above code, we end up with the following resultant configuration:

```yml
App\Data\MyDataClass:
  my_configuration_property:
    key1: 'value1'
    key2: 'value2'
    key3: 'value3'
  new_config_property: true
  extensions:
    - App\Extension\MyDataClassConfigExtension

App\Extension\MyDataClassConfigExtension:
  my_configuration_property:
    key1: 'not overridden'
    key3: 'value3'
  new_config_property: true
```

> [!WARNING]
> Note that the value for `key1` in the `my_configuration_property` array was *not* overridden by the extension class. Configuration declared in an extension class is merged into the base class as a lower priority than the base class itself. Where there is any collision between the configuration declared on the base class and on the extension class, the base class configuration is used.
>
> If you need to override values, you should do so using the [yml configuration API](/developer_guides/configuration/configuration).
>
> ```yml
> App\Data\MyDataClass:
>   my_configuration_property:
>     key1: 'is overridden'
> ```

See [Configuration API](/developer_guides/configuration/configuration/) for more information about configuration properties.

## Adding database fields

Extra database fields can be added with a extension in the same manner as if they were placed on the `DataObject` class
they're applied to. These will be added to the table of the base object.

Because `$db`, `$has_one`, etc are ultimately just configuration properties, they work the same way as described in [adding configuration properties](#adding-configuration-properties) above.

```php
// app/src/extension/MyMemberExtension.php
namespace App\Extension;

use SilverStripe\Assets\Image;
use SilverStripe\Core\Extension;

class MyMemberExtension extends Extension
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

Public methods that have a unique name will be called as part of the `__call` method on the extended object. In the first example on this page
we added a `getGreeting` method which is unique to our extension.

```ss
<%-- app/templates/Page.ss --%>
<p>$CurrentMember.Greeting</p>
<%-- "Hi Sam" --%>
```

```php
// app/src/Extension/MyMemberExtension.php
namespace App\Extension;

$member = Security::getCurrentUser();
// "Hi Sam"
echo $member->getGreeting();
```

> [!WARNING]
> Note that `protected`, `private`, and `static` methods *are not* accessible from the extended object/class.

## Modifying existing methods

If the `Extension` needs to modify an existing method it's a little trickier. It requires that the method you want to
customise has provided an *Extension Hook* in the place where you want to modify the data. An *Extension Hook* is done
through the [`extend()`](api:SilverStripe\Core\Extensible::extend()) or [`invokeWithExtensions()`](api:SilverStripe\Core\Extensible::invokeWithExtensions()) method of the `Extensible` trait.

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

use SilverStripe\Core\Extension;

class MyMemberExtension extends Extension
{
    protected function updateValidator($validator)
    {
        // we want to make date of birth required for each member
        $validator->addRequiredField('DateOfBirth');
    }
}
```

> [!NOTE]
> In this case the `$validator` argument can be modified directly, as it is an object. To modify literals, you will need to [explicitly pass by reference](https://www.php.net/manual/en/language.references.pass.php).

Another common example of when you will want to modify a method is to update the default CMS fields for an object in an
extension. The `CMS` provides a `updateCMSFields` Extension Hook to tie into.

```php
namespace App\Extension;

use SilverStripe\AssetAdmin\Forms\UploadField;
use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;

class MyMemberExtension extends Extension
{
    private static $db = [
        'Position' => 'Varchar',
    ];

    private static $has_one = [
        'Image' => 'Image',
    ];

    protected function updateCMSFields(FieldList $fields)
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

The convention for extension hooks is to provide an `update{$Function}` hook at the end before you return the result. If
you need to provide extension hooks at the beginning of the method use `before{$Function}`.

## Checking to see if an object has an extension

To see what extensions are currently enabled on an object, use the [getExtensionInstances()](api:SilverStripe\Core\Extensible::getExtensionInstances()) and
[hasExtension()](api:SilverStripe\Core\Extensible::hasExtension()) methods of the [Extensible](api:SilverStripe\Core\Extensible) trait.

```php
$member = Security::getCurrentUser();

if ($member->hasExtension(MyCustomMemberExtension::class)) {
    // ...
}

foreach ($member->getExtensionInstances() as $extension) {
    // ...
};
```

## Extension injection points

`Extensible` has two additional methods, `beforeExtending` and `afterExtending`, each of which takes a method name and a
callback to be executed immediately before and after `extend()` is called on extensions.

This is useful in many cases where working with modules such as `tractorcow/silverstripe-fluent` which operate on `DataObject` fields
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

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataObject;

class MyModel extends DataObject
{
    // ...

    public function getCMSFields()
    {
        $this->beforeUpdateCMSFields(function (FieldList $fields) {
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

Extension classes can be overridden using the Injector, if you want to modify the way that an extension in one of
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
> Please note that overriding the extension like this should be done in YAML configuration using the injector only. It is not recommended
> to use `Config::modify()->set()` to adjust the implementation class name of an extension after the configuration
> manifest has been loaded, which may not work consistently due to the "extra methods" cache having already been
> populated.

## Related documentation

- [Injector](injector/)

## API documentation

- [Extension](api:SilverStripe\Core\Extension)
