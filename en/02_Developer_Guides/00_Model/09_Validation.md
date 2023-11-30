---
title: Model Validation and Constraints
summary: Validate your data at the model level
icon: check-square
---

# Validation and constraints

Traditionally, validation in Silverstripe CMS has been mostly handled through [form validation](../forms).

While this is a useful approach, it can lead to data inconsistencies if the record is modified outside of the form context.

Most validation constraints are actually data constraints which belong on the model. Silverstripe CMS provides the
[`DataObject::validate()`](api:SilverStripe\ORM\DataObject::validate()) method for this purpose. The `validate()` method is
called any time the `write()` method is called, before the `onBeforeWrite()` extension hook.

By default, there is no validation - objects are always valid! However, you can override this method in your `DataObject`
sub-classes to specify custom validation, or use the `validate()` extension hook through an [Extension](api:SilverStripe\Core\Extension).

Invalid objects won't be able to be written - a [`ValidationException`](api:SilverStripe\ORM\ValidationException) will be thrown and no write will occur.

Ideally you should call `validate()` in your own application to test that an object is valid before attempting a
write, and respond appropriately if it isn't.

The return value of `validate()` is a [`ValidationResult`](api:SilverStripe\ORM\ValidationResult) object.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyObject extends DataObject
{
    private static $db = [
        'Country' => 'Varchar',
        'Postcode' => 'Varchar',
    ];

    public function validate()
    {
        $result = parent::validate();

        if ($this->Country == 'DE' && $this->Postcode && strlen($this->Postcode) != 5) {
            $result->addError('Need five digits for German postcodes');
        }

        return $result;
    }
}
```

## API documentation

- [DataObject](api:SilverStripe\ORM\DataObject)
- [ValidationResult](api:SilverStripe\ORM\ValidationResult);
