---
title: Model Validation and Constraints
summary: Validate your data at the model level
icon: check-square
---

# Validation and constraints

## Validation using `symfony/validator` constraints {#symfony-validator}

The [`ConstraintValidator`](api:SilverStripe\Core\Validation\ConstraintValidator) class provides an abstraction around [`symfony/validator`](https://symfony.com/doc/current/components/validator.html), so you can easily validate values against symfony's validation constraints and get a [`ValidationResult`](api:SilverStripe\ORM\ValidationResult) object with the result.

```php
use SilverStripe\Core\Validation\ConstraintValidator;

/**
 * @var \Symfony\Component\Validator\Constraint $constraint
 * @var \SilverStripe\ORM\ValidationResult $result
 */
$result = ConstraintValidator::validate($valueToValidate, $constraint);
```

For example, to test if a URL is valid:

```php
use SilverStripe\Core\Validation\ConstraintValidator;
use Symfony\Component\Validator\Constraints\Url;

$isValid = ConstraintValidator::validate($url, new Url())->isValid();
```

You can use most of the constraints listed in Symfony's [supported constraints](https://symfony.com/doc/current/reference/constraints.html) documentation, though note that some of them require additional symfony dependencies.

Validation using constraints that rely on `symfony/doctrine` is explicitly not supported in Silverstripe CMS.

## Model validation

Traditionally, validation in Silverstripe CMS has been mostly handled through [form validation](../forms/validation). While this is a useful approach, it can lead to data inconsistencies if the record is modified outside of the form context.

Most validation constraints are actually data constraints which belong on the model. Silverstripe CMS provides the
[`DataObject::validate()`](api:SilverStripe\ORM\DataObject::validate()) method for this purpose. The `validate()` method is
called any time the `write()` method is called, before the `onBeforeWrite()` extension hook.

By default, there is no validation - objects are always valid! However, you can override this method in your `DataObject`
sub-classes to specify custom validation, or use the `updateValidate()` extension hook through an [Extension](api:SilverStripe\Core\Extension).

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

        // This will add a field specific error to the ValidationResult
        if (strlen($this->Postcode) > 10) {
            $result->addFieldError('Postcode', 'Postcode is too long');
        }

        // This will add a general error to the ValidationResult
        if ($this->Country == 'DE' && $this->Postcode && strlen($this->Postcode) !== 5) {
            $result->addError('Need five digits for German postcodes');
        }

        return $result;
    }
}
```

## API documentation

- [DataObject](api:SilverStripe\ORM\DataObject)
- [ValidationResult](api:SilverStripe\ORM\ValidationResult);
