---
title: ChildFieldManager
summary: Strict management of child fields for advanced use cases
---

# `ChildFieldManager`

In most cases, child form fields can be grouped with a [`CompositeField`](api:SilverStripe\Forms\CompositeField) or one of its subclasses - but sometimes you need more control.

For example, you may have a use case where specific form fields *must* be present in the child field list. In that case you won't want methods like [`FieldList::removeByName()`](api:SilverStripe\Forms\FieldList::removeByName()) or [`FieldList::replaceField()`](api:SilverStripe\Forms\FieldList::replaceField()) to know about your child fields, but you'll still want to expose them for things like [`Form::loadDataFrom()`](api:SilverStripe\Forms\Form::loadDataFrom()), [`Form::saveInto()`](api:SilverStripe\Forms\Form::saveInto()), and allow them to manage their own AJAX requests.

To achieve this, your custom [`FormField`](api:SilverStripe\Forms\FormField) can implement the [`ChildFieldManager`](api:SilverStripe\Forms\ChildFieldManager) interface. The methods declared in this interface allow the form to access your fields for critical functionality, but doesn't let anyone remove or replace fields in your managed child field list.

In order to get managed fields from a `FieldList`, call [`FieldList::getDataFields(true)`](api:SilverStripe\Forms\FieldList::getDataFields()).This method replaces the now deprecated [`FieldList::dataFields()`](api:SilverStripe\Forms\FieldList::dataFields()) method.

Calling `FieldList::getDataFields()` with no arguments, or passing in `false` explicitly, is the same as calling the old `FieldList::dataFields()` method. If you pass in `true`, that differs in two ways:

1. It gets all data fields *including* those managed by a `ChildFieldManager`, which are excluded when passing `false`
1. Fields returned from a `ChildFieldManager` are not cached. This allows child field managers to swap out the form field implementation if their logic requires it.

A very simple implementation of this interface would look like this:

> [!WARNING]
> The below example shows a minimal PHP implementation but not the template.
> The assumption is if you're implementing this interface, you already have an advanced use case and know what you need to do in your template to get your use case broadly working.

```php
namespace App\Form;

use SilverStripe\Core\Validation\FieldValidation\CompositeFieldValidator;
use SilverStripe\Forms\ChildFieldManager;
use SilverStripe\Forms\FormField;
use SilverStripe\Forms\TextField;

class MyChildFieldManager extends FormField implements ChildFieldManager
{
    private static array $field_validators = [
        CompositeFieldValidator::class,
    ];

    private array $children = [];

    public function __construct()
    {
        $this->children = [
            'FieldOne' => TextField::create('FieldOne'),
            'FieldTwo' => TextField::create('FieldTwo'),
        ];
        parent::__construct('MyManagedField');
    }

    public function isManagedField(string $fieldName): bool
    {
        return array_key_exists($fieldName, $this->children);
    }

    public function getManagedFieldByName(string $fieldName): ?FormField
    {
        return $this->children[$fieldName] ?? null;
    }

    public function getManagedFields(): iterable
    {
        return $this->children;
    }

    public function getValueForValidation(): mixed
    {
        // Ensure child fields get validated by the CompositeFieldValidator
        return $this->children;
    }

    public function getSchemaDataDefaults(): array
    {
        $defaults = parent::getSchemaDataDefaults();
        // Include child schema data for react forms
        $children = $this->getChildren();
        foreach ($children as $child) {
            $childSchema[] = $child->getSchemaData();
        }
        $defaults['children'] = $childSchema;
        return $defaults;
    }
}
```

You can then implement whatever logic you want and rely on those specific fields being there no matter what anyone else is doing with your form.

> [!TIP]
> It's usually a good idea to ensure that if [`FormField::setForm()`](api:SilverStripe\Forms\FormField::setForm()), [`FormField::performReadonlyTransformation()`](api:SilverStripe\Forms\FormField::performReadonlyTransformation()), [`FormField::performDisabledTransformation()`](api:SilverStripe\Forms\FormField::performDisabledTransformation()), [`FormField::setReadonly()`](api:SilverStripe\Forms\FormField::setReadonly()), or [`FormField::setDisabled()`](api:SilverStripe\Forms\FormField::setDisabled()) is called on your parent form, the appropriate methods are called on your child fields a well.
