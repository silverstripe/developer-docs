---
title: CMS alternating button
summary: Add an "active" and "neutral" state to the CMS buttons
---

# How to implement an alternating button

## Introduction

The *Save* and *Publish* buttons alternate their appearance to reflect the state of the underlying record.

The button's text, CSS classes, and icon for two different states can be configured via data attributes. The
state is toggled on the frontend based on the dirty state of the form.

This how-to will walk you through setting the text, CSS classes, and icon for two states:

- active: "Save" green constructive button if the actions can be performed
- neutral: "Saved" default button if the action does not need to be done

The same functionality is available for the *Publish* button in the CMS for versioned records.

## Setting the data attributes

For this example we'll update the attributes on the *Save* button on the [`SiteTree`](api:SilverStripe\CMS\Model\SiteTree) class. Note that the same principle applies for other buttons that use these attributes, such as the *Publish* button, and for buttons added through [`GridFieldDetailForm_ItemRequest`](api:SilverStripe\Forms\GridField\GridFieldDetailForm_ItemRequest).

The title, icon, and CSS classes of the button define its default state. The following data attributes are used to define the alternate state:

- `data-icon-alternate`: icon to be shown when the button is in the alternate state (replaces any icon set with [`setIcon()`](api:SilverStripe\Forms\FormAction::setIcon()))
- `data-text-alternate`: text to be shown when the button is in the alternate state (replaces any text set with [`setTitle()`](api:SilverStripe\Forms\FormField::setTitle()))
- `data-btn-alternate-add`: space-separated list of CSS classes to add when the button is in the alternate state. These will be removed when toggling back to the default state.
- `data-btn-alternate-remove`: space-separated list of CSS classes to remove when the button is in the alternate state. These will be added when toggling back to the default state.

Here is the code for the button:

```php
namespace App\Extension;

use SilverStripe\Core\Extension;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\FormAction;

class MySiteTreeActionExtension extends Extension
{
    // ...

    protected function updateCMSActions(FieldList $actions)
    {
        /** @var FormAction $saveButton */
        $saveButton = $actions->dataFieldByName('action_save');
        // Set the text for the default and alternate states
        $saveButton->setTitle('Saved already');
        $saveButton->setAttribute('data-text-alternate', 'Save me');
        // Set the icon for the default and alternate states
        $saveButton->setIcon('happy');
        $saveButton->setAttribute('data-icon-alternate', 'sad');
        // Set any CSS class names that you want to alternate between
        // Note that any classes that apply to the default state must be added with addExtraClass()
        // and any which were already applied that you don't want must be removed with removeExtraClass()
        $saveButton->addExtraClass('my-default-btn-class');
        $saveButton->setAttribute('data-btn-alternate-remove', 'btn-outline-primary my-default-btn-class');
        $saveButton->setAttribute('data-btn-alternate-add', 'btn-primary my-alternate-btn-class');
    }
}
```

```yml
SilverStripe\CMS\Model\SiteTree:
  extensions:
    - 'App\Extension\MySiteTreeActionExtension'
```
