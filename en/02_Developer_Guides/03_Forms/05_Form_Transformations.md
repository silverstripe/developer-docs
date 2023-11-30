---
title: Form Transformations
summary: Provide read-only and disabled views of your Form data.
icon: random
---

# Read-only and disabled forms

[Form](api:SilverStripe\Forms\Form) and [FormField](api:SilverStripe\Forms\FormField) instances can be turned into a read-only version for things like confirmation pages or
when certain fields cannot be edited due to permissions. Creating the form is done the same way and markup is similar,
`readonly` mode converts the `input`, `select` and `textarea` tags to static HTML elements like `span`.

To make an entire [`Form`](api:SilverStripe\Forms\Form) read-only:

```php
use SilverStripe\Forms\Form;

$form = Form::create(/* ... */);
$form->makeReadonly();
```

To make all the fields within a [`FieldList`](api:SilverStripe\Forms\FieldList) read-only (i.e.to make fields read-only but not buttons):

```php
use SilverStripe\Forms\FieldList;

$fields = FieldList::create(/* ... */);
$fields = $fields->makeReadonly();
```

To make an individual [`FormField`](api:SilverStripe\Forms\FormField) read-only you need to know the name of the form field or call it directly on the object:

```php
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextField;

$field = TextField::create(/* ... */);
$field = $field->performReadonlyTransformation();

$fields = FieldList::create(
    $field
);

// Or,
$field = TextField::create(/* ... */);
$field->setReadonly(true);

$fields = FieldList::create(
    $field
);

// Or,
$fields->dataFieldByName('myField')->setReadonly(true);
```

## Disabled formFields

Disabling [FormField](api:SilverStripe\Forms\FormField) instances, sets the `disabled` property on the class. This will use the same HTML markup as
a normal form, but set the `disabled` attribute on the `input` tag.

```php
$field = TextField::create(/* ... */);
$field->setDisabled(true);

// prints '<input type="text" class="text" .. disabled="disabled" />'
echo $field->forTemplate();
```
