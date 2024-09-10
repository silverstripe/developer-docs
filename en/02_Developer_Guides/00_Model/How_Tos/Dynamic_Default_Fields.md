---
title: Dynamic Default Fields
summary: Learn how to add default values to your models
---

# Default values and records

> [!TIP]
> This page is about defining default values and records in your model class, which only affects *new* records. You can set defaults directly in the database-schema, which affects *existing* records as well. See
> [Data Types and Casting](/developer_guides/model/data_types_and_casting/#default-values) for details.

## Static default values

The [DataObject::$defaults](api:SilverStripe\ORM\DataObject::$defaults) array allows you to specify simple static values to be the default values when a record is created.

A simple example is if you have a dog and by default its bark is "Woof":

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Dog extends DataObject
{
    private static $db = [
        'Bark' => 'Varchar(10)',
    ];

    private static $defaults = [
        'Bark' => 'Woof',
    ];
}
```

## Dynamic default values

In many situations default values need to be dynamically calculated. In order to do this, the
[DataObject::populateDefaults()](api:SilverStripe\ORM\DataObject::populateDefaults()) method will need to be overridden.

This method is called whenever a new record is instantiated, and you must be sure to call the method on the parent
object!

A simple example is to set a field to the current date and time:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Dog extends DataObject
{
    // ...

    /**
     * Sets the Date field to the current date.
     */
    public function populateDefaults()
    {
        $this->Date = date('Y-m-d');
        parent::populateDefaults();
    }
}
```

> [!TIP]
> This method is called very early in the process of instantiating a new record, before any relations are set for it. If you want to set values based on, for example, a `has_one` relation called `Parent`, you can do that by implementing [`onBeforeWrite()`](/developer_guides/model/extending_dataobjects/#onbeforewrite) or a [setter method](/developer_guides/model/data_types_and_casting/#overriding) - for example:
>
> ```php
> namespace App\Model;
>
> use SilverStripe\ORM\DataObject;
>
> class Dog extends DataObject
> {
>     // ...
>
>     protected function onBeforeWrite()
>     {
>         // Only do this if the record hasn't been written to the database yet (optional)
>         if (!$this->isInDb()) {
>             $parent = $this->Parent();
>             // Set the FullTitle based on the parent, if one exists
>             if ($parent->exists()) {
>                 $this->FullTitle = $parent->Title . ': ' . $this->Title;
>             } else {
>                 $this->FullTitle = $this->Title;
>             }
>         }
>     }
>
>     // or
>
>     public function setFullTitle($value): static
>     {
>         $parent = $this->Parent();
>         // Set the FullTitle based on the parent, if one exists
>         if ($parent->exists()) {
>             $value = $parent->Title . ': ' . $value;
>         }
>         return $this->setField('FullTitle', $value);
>     }
> }
> ```

## Static default records

The [DataObject::$default_records](api:SilverStripe\ORM\DataObject::$default_records) array allows you to specify default records created when the database is built.

A simple example of this is having a region model and wanting a list of regions created when the site is built:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Region extends DataObject
{
    private static $db = [
        'Title' => 'Varchar(45)',
    ];

    private static $default_records = [
        ['Title' => 'Auckland'],
        ['Title' => 'Coromandel'],
        ['Title' => 'Waikato'],
    ];
}
```

## Dynamic default records

Just like default values, there are times when you want your default *records* to have some dynamic value or to be created only under certain conditions. To achive this, override the
[DataObject::requireDefaultRecords()](api:SilverStripe\ORM\DataObject::requireDefaultRecords()) method.

```php
use SilverStripe\Control\Director;

//...

public function requireDefaultRecords()
{
    // Require the base defaults first - that way the records we create below won't interfere with any
    // declared in $default_records
    parent::requireDefaultRecords();

    // Make some record only if we're in dev mode and we don't have any of the current class yet.
    if (Director::isDev() && !DataObject::get_one(static::class)) {
        $record = static::create(['Date' => date('Y-m-d')]);
        $record->write();
    }
}
```
