---
title: Form Validation
summary: Validate form data through the server side validation API.
icon: check-square
---

# Form validation

Silverstripe CMS provides server-side form validation out of the box through the [Validator](api:SilverStripe\Forms\Validator) class and its' child classes
(see [available validators](#available-validators) below). A single `Validator` instance is set on each `Form`. Validators are implemented as an argument to
the [Form](api:SilverStripe\Forms\Form) constructor or through the function `setValidator`.

```php
namespace App\PageType;

use PageController;
use SilverStripe\Forms\EmailField;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Forms\TextField;

class MyFormPageController extends PageController
{
    private static $allowed_actions = [
        'getMyForm',
    ];

    private static $url_handlers = [
        'MyForm' => 'getMyForm',
    ];

    public function getMyForm()
    {
        $fields = FieldList::create(
            TextField::create('Name'),
            EmailField::create('Email')
        );

        $actions = FieldList::create(
            FormAction::create('doSubmitForm', 'Submit')
        );

        // the fields 'Name' and 'Email' are required.
        $required = RequiredFields::create([
            'Name', 'Email',
        ]);

        // $required can be set as an argument
        $form = Form::create($controller, 'MyForm', $fields, $actions, $required);

        // Or, through a setter.
        $form->setValidator($required);

        return $form;
    }

    public function doSubmitForm($data, $form)
    {
        // ...
    }
}
```

In this example we will be required to input a value for `Name` and a valid email address for `Email` before the
`doSubmitForm` method is called.

> [!NOTE]
> Each individual [FormField](api:SilverStripe\Forms\FormField) instance is responsible for validating the submitted content through the
> [FormField::validate()](api:SilverStripe\Forms\FormField::validate()) method. By default, this just checks the value exists. Fields like `EmailField` override
> `validate` to check for a specific format.

Subclasses of `FormField` can define their own version of `validate` to provide custom validation rules such as the
above example with the `Email` validation. The `validate` method on `FormField` takes a single argument of the current
`Validator` instance.

```php
namespace App\Form\Field;

use SilverStripe\Forms\NumericField;

class CustomNumberField extends NumericField
{
    public function validate($validator)
    {
        if ((int) $this->Value() === 10) {
            $validator->validationError($this->Name(), 'This value cannot be 10');
            return false;
        }

        return true;
    }
}
```

The `validate` method should return `true` if the value passes any validation and `false` if Silverstripe CMS should trigger
a validation error on the page. In addition a useful error message must be set on the given validator.

> [!WARNING]
> You can also override the entire `Form` validation by subclassing `Form` and defining a `validate` method on the form.

Say we need a custom `FormField` which requires the user input a value in a `NumericField` between 2 and 5. There would be
two ways to go about this:

A custom `FormField` which handles the validation. This means the `FormField` can be reused throughout the site and have
the same validation logic applied to it throughout.

```php
// app/src/Form/Field/CustomNumberField.php
namespace App\Form\Field;

use SilverStripe\Forms\NumericField;

class CustomNumberField extends NumericField
{
    public function validate($validator)
    {
        if (!is_numeric($this->value)) {
            $validator->validationError(
                $this->name,
                'Not a number. This must be between 2 and 5',
                'validation',
                false
            );

            return false;
        } elseif ($this->value > 5 || $this->value < 2) {
            $validator->validationError(
                $this->name,
                'Your number must be between 2 and 5',
                'validation',
                false
            );

            return false;
        }

        return true;
    }
}
```

Or, an alternative approach to the custom class is to define the behavior inside the Form's action method. This is less
reusable and would not be possible within the `CMS` or other automated `UI` but does not rely on creating custom
`FormField` classes.

```php
namespace App\PageType;

use PageController;
use SilverStripe\Forms\EmailField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\ValidationResult;
use SilverStripe\Security\Member;

class MyFormPageController extends PageController
{
    // ...

    public function getMyForm()
    {
        $fields = FieldList::create(
            TextField::create('Name'),
            EmailField::create('Email')
        );

        $actions = FieldList::create(
            FormAction::create('doSubmitForm', 'Submit')
        );

        $form = Form::create($this, 'MyForm', $fields, $actions);

        return $form;
    }

    public function doSubmitForm($data, $form)
    {
        // At this point, RequiredFields->isValid() will have been called already,
        // so we can assume that the values exist. Say we want to make sure that email hasn't already been used.

        $check = Member::get()->filter('Email', $data['Email'])->first();

        if ($check) {
            $validationResult = ValidationResult::create();
            $validationResult->addFieldError('Email', 'This email already exists');
            $form->setSessionValidationResult($validationResult);
            $form->setSessionData($form->getData());
            return $this->redirectBack();
        }


        $form->sessionMessage('You have been added to our mailing list', 'good');

        return $this->redirectBack();
    }
}
```

## Available validators

The Silverstripe framework comes with the following built-in validators:

- [`CompositeValidator`](api:SilverStripe\Forms\CompositeValidator)
  A container for additional validators. You can implement discrete validation logic in multiple `Validator` subclasses and apply them *all* to a
  given form by putting them inside a `CompositeValidator`. The `CompositeValidator` doesn't have perform any validation by itself.
- [`FieldsValidator`](api:SilverStripe\Forms\FieldsValidator)
  Simply calls [`validate()`](api:SilverStripe\Forms\FormField::validate()) on all data fields in the form, to ensure fields have valid values.
- [`RequiredFields`](api:SilverStripe\Forms\RequiredFields)
  Validates that fields you declare as "required" have a value.

There are additional validators available in community modules, and you can implement your own validators by subclassing the abstract `Validator` class.

## Exempt validation actions

In some cases you might need to disable validation for specific actions. For example actions which discard submitted
data may not need to check the validity of the posted content.

You can disable validation on individual using one of two methods:

```php
namespace App\PageType;

use PageController;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;

class MyFormPageController extends PageController
{
    // ...

    public function getMyForm()
    {
        // ...

        $actions = FieldList::create(
            $action = FormAction::create('doSubmitForm', 'Submit')
        );

        $form = Form::create($this, 'MyForm', $fields, $actions);
        // Disable actions on the form action themselves
        $action->setValidationExempt(true);
        // Alternatively, you can whitelist individual actions on the form object by name
        $form->setValidationExemptActions(['doSubmitForm']);

        return $form;
    }

    // ...
}
```

## Server-side validation messages

If a `FormField` fails to pass `validate()` the default error message is returned.

```text
'$Name' is required
```

Use `setCustomValidationMessage` to provide a custom message.

```php
use SilverStripe\Forms\TextField;

$field = TextField::create(/* .. */);
$field->setCustomValidationMessage('Whoops, looks like you have missed me!');
```

## JavaScript validation

Although there are no built-in JavaScript validation handlers in Silverstripe CMS, the `FormField` API is flexible enough
to provide the information required in order to plug in custom libraries like [Parsley.js](http://parsleyjs.org/) or
[jQuery.Validate](http://jqueryvalidation.org/). Most of these libraries work on HTML `data-` attributes or special
classes added to each input. For Parsley we can structure the form like.

```php
namespace App\PageType;

use PageController;
use SilverStripe\Forms\Form;

class MyFormPageController extends PageController
{
    // ...

    public function getMyForm()
    {
        // ...

        $form = Form::create($this, 'MyForm', $fields, $actions);
        $form->setAttribute('data-parsley-validate', true);

        $field = $fields->dataFieldByName('Name');
        $field->setAttribute('required', true);
        $field->setAttribute('data-parsley-mincheck', '2');

        return $form;
    }
}
```

## Model validation

An alternative (or additional) approach to validation is to place it directly on the database model. Silverstripe CMS
provides a [DataObject::validate()](api:SilverStripe\ORM\DataObject::validate()) method to validate data at the model level. See
[Data Model Validation](../model/validation).

## Form action validation

At times it's not possible for all validation or recoverable errors to be pre-determined in advance of form
submission, such as those generated by the form [Validator](api:SilverStripe\Forms\Validator) object. Sometimes errors may occur within form
action methods, and it is necessary to display errors on the form after initial validation has been performed.

In this case you may throw a [ValidationException](api:SilverStripe\ORM\ValidationException) object within your handler, optionally passing it an
error message, or a [ValidationResult](api:SilverStripe\ORM\ValidationResult) object containing the list of errors you wish to display.

For example:

```php
namespace App\Control;

use SilverStripe\Control\Controller;
use SilverStripe\ORM\ValidationException;

class MyController extends Controller
{
    // ...

    public function doSave($data, $form)
    {
        $success = $this->sendEmail($data);

        // Example error handling
        if (!$success) {
            throw new ValidationException('Sorry, we could not email to that address');
        }

        // If success
        return $this->redirect($this->Link('success'));
    }
}
```

### Validation in the CMS

In the CMS, we're not creating the forms for editing CMS records. The `Form` instance is generated for us so we cannot
call `setValidator` easily. However, a `DataObject` can provide its own `Validator` instance/s through the
`getCMSCompositeValidator()` method. The CMS interfaces such as [LeftAndMain](api:SilverStripe\Admin\LeftAndMain),
[ModelAdmin](api:SilverStripe\Admin\ModelAdmin) and [GridField](api:SilverStripe\Forms\GridField\GridField) will
respect the provided `Validator`/s and handle displaying error and success responses to the user.

> [!NOTE]
> Again, custom error messages can be provided through the `FormField`

```php
namespace App\PageType;

use Page;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\Forms\TextField;

class MyPage extends Page
{
    private static $db = [
        'MyRequiredField' => 'Text',
    ];

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->addFieldToTab(
            'Root.Main',
            TextField::create('MyRequiredField')->setCustomValidationMessage('You missed me.')
        );
    }

    public function getCMSValidator()
    {
        return RequiredFields::create([
            'MyRequiredField',
        ]);
    }
}
```

## Related lessons

- [Introduction to frontend forms](https://www.silverstripe.org/learn/lessons/v4/introduction-to-frontend-forms-1)

## API documentation

- [RequiredFields](api:SilverStripe\Forms\RequiredFields)
- [Validator](api:SilverStripe\Forms\Validator)
