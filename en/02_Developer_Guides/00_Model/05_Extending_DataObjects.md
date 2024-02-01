---
title: Extending DataObjects
summary: Modify the data model without using subclasses.
---

# Extending `DataObject` models

You can add properties and methods to existing [`DataObject`](api:SilverStripe\ORM\DataObject) subclasses like [`Member`](api:SilverStripe\Security\Member) without hacking core code or subclassing by using an [`Extension`](api:SilverStripe\Core\Extension). See the [Extending Silverstripe CMS](../extending) guide for more information.

The following documentation outlines some common hooks that the [`Extension`](api:SilverStripe\Core\Extension) API provides specifically for managing
data records. Note that this is *not* an exhaustive list - we encourage you to look at the source code to see what other extension hooks are available.

> [!WARNING]
> Avoid using the hooks shown here for checking permissions or validating data - there are specific mechanisms for handling those scenarios. See [permissions](permissions) and [validation](validation) respectively.

## `onBeforeWrite`

You can customise saving behavior for each `DataObject`, e.g. for adding workflow or data customization. The function is
triggered when calling [`write()`](api:SilverStripe\ORM\DataObject::write()) to save the object to the database. This includes saving a page in the CMS or altering
a record via code.

Example: Make sure the player has a valid and unique player number for their team when being assigned a new team.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $db = [
        // ...
        'Number' => 'Int',
    ];

    private static $has_one = [
        'Team' => Team::class,
    ];

    public function onBeforeWrite()
    {
        // Use $this->isInDb() to check if the record is being written to the database for the first time
        if (!$this->isInDb() && $this->Team()->exists()) {
            $this->Number = $this->Team()->getAvailablePlayerNumber();
        }

        // If the player changed teams
        if ($this->isChanged('TeamID') && $this->Team()->exists()) {
            // If the player's number is already used by someone else on this team
            if (in_array($this->Number, $this->Team()->Players()->exclude('ID', $this->ID)->column('Number'))) {
                // Assign a new player number
                $this->Number = $this->Team()->getAvailablePlayerNumber();
            }
        }

        // CAUTION: You are required to call parent::onBeforeWrite(), otherwise
        // SilverStripe will not execute the request.
        parent::onBeforeWrite();
    }
}
```

## `onBeforeDelete`

Triggered before executing [`delete()`](api:SilverStripe\ORM\DataObject::delete()) on an existing object. It can be useful if you need to make sure you clean up some other data/files/etc which aren't directly associated with the actual `DataObject` record.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    // ...

    public function onBeforeDelete()
    {
        /* Do some cleanup here relevant to your project before deleting the actual database record */

        // CAUTION: You are required to call parent::onBeforeDelete(), otherwise
        // SilverStripe will not execute the request.
        parent::onBeforeDelete();
    }
}
```

> [!WARNING]
> Note: There are no separate methods for `onBeforeCreate()` and `onBeforeUpdate()`. Please check `$this->isInDb()` to toggle
> these two modes, as shown in the example above.

## Related lessons

- [Working with data relationships - $has_many](https://www.silverstripe.org/learn/lessons/v4/working-with-data-relationships-has-many-1)
