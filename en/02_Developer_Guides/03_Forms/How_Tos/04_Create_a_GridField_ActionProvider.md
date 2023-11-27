---
title: How to add a custom action to a GridField row
summary: Handle custom actions on your GridField
---
# How to add a custom action to a `GridField` row

You can add an action to the row(s) of a [GridField](/developer_guides/forms/field_types/gridfield), such as the built in edit or delete actions.

In a [GridField](/developer_guides/forms/field_types/gridfield) instance each table row can have a
number of actions located the end of the row.
Each action is represented as a instance of a specific class
(e.g. [GridFieldEditButton](api:SilverStripe\Forms\GridField\GridFieldEditButton)) which has been added to the `GridFieldConfig`
for that `GridField`

As a developer, you can create your own custom actions to be located alongside
the built in buttons.

For example let's create a custom action on the GridField to allow the user to
perform custom operations on a row:

1. Create a custom action
1. [Add your custom action to the `GridFieldConfig`](#add-action-to-config)

[info]
To create a custom action follow the [Basic GridField custom action boilerplate](#custom-action-boilerplate) below.

If you would like to create a custom action in the GridField action menu follow the
[Add a GridField custom action to the `GridField_ActionMenu`](#implement-gridfield-actionmenuitem)
[/info]

## Basic `GridField` custom action boilerplate {#custom-action-boilerplate}

A basic outline of our new `GridFieldCustomAction.php` will look like something
below:

```php
namespace App\Form\GridField;

use SilverStripe\Control\Controller;
use SilverStripe\Forms\GridField\AbstractGridFieldComponent;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridField_ActionProvider;
use SilverStripe\Forms\GridField\GridField_ColumnProvider;
use SilverStripe\Forms\GridField\GridField_FormAction;

class GridFieldCustomAction extends AbstractGridFieldComponent implements
    GridField_ColumnProvider,
    GridField_ActionProvider
{
    public function augmentColumns($gridField, &$columns)
    {
        if (!in_array('Actions', $columns)) {
            $columns[] = 'Actions';
        }
    }

    public function getColumnAttributes($gridField, $record, $columnName)
    {
        return ['class' => 'grid-field__col-compact'];
    }

    public function getColumnMetadata($gridField, $columnName)
    {
        if ($columnName === 'Actions') {
            return ['title' => ''];
        }
        return [];
    }

    public function getColumnsHandled($gridField)
    {
        return ['Actions'];
    }

    public function getColumnContent($gridField, $record, $columnName)
    {
        if (!$record->hasMethod('canEdit') || !$record->canEdit()) {
            return null;
        }

        $field = GridField_FormAction::create(
            $gridField,
            'CustomAction' . $record->ID,
            'Custom Action',
            'docustomaction',
            ['RecordID' => $record->ID]
        );
        // Add some styling so we don't have a plain unstyled button. These styles
        // are available in the CMS, so you don't have to add any custom css.
        $field->addExtraClass('btn btn-outline-dark');

        return $field->Field();
    }

    public function getActions($gridField)
    {
        return ['docustomaction'];
    }

    public function handleAction(GridField $gridField, $actionName, $arguments, $data)
    {
        // Note: The action name here MUST be lowercase. GridField does a strtolower transformation
        // before passing it in.
        if ($actionName !== 'docustomaction') {
            return;
        }
        // perform your action here

        // output a success message to the user
        Controller::curr()->getResponse()
            ->setStatusCode(200)
            ->addHeader('X-Status', 'Do Custom Action Done.');
    }
}
```

First thing to note is that our new class implements two interfaces,
[`GridField_ColumnProvider`](api:SilverStripe\Forms\GridField\GridField_ColumnProvider) and [`G`ridField_ActionProvider`](api:SilverStripe\Forms\GridField\GridField_ActionProvider).

Each interface allows our class to define particular behaviors and is a core
concept of the modular `GridFieldConfig` system.

The `GridField_ColumnProvider` implementation tells Silverstripe CMS that this class
will provide the `GridField` with an additional column of information. By
implementing this interface we're required to define several methods to explain
where we want the column to exist and how we need it to be formatted. This is
done via the following methods:

- [`augmentColumns()`](api:SilverStripe\Forms\GridField\GridField_ColumnProvider::augmentColumns()) - modifies the list of columns displayed in the table
- [`getColumnAttributes()`](api:SilverStripe\Forms\GridField\GridField_ColumnProvider::getColumnAttributes()) - attributes for the element containing the content
- [`getColumnMetadata()`](api:SilverStripe\Forms\GridField\GridField_ColumnProvider::getColumnMetadata()) - additional metadata about the column which can be used by other components
- [`getColumnsHandled()`](api:SilverStripe\Forms\GridField\GridField_ColumnProvider::getColumnsHandled()) - names of all columns which are affected by this component
- [`getColumnContent()`](api:SilverStripe\Forms\GridField\GridField_ColumnProvider::getColumnContent()) - HTML for the column, content of the element

In this example, we're simply adding a new item to the existing `Actions` column
located at the end of the table. Our `getColumnContent()` implementation produces
a custom button for the user to click on the page.

We also make sure the `Actions` column exists if it wasn't already there (in `augmentColumns()`).
This ensures that our action will still be rendered even if the `GridFieldActionMenu` component
isn't used. `getColumnAttributes()` and `getColumnMetadata()` provide a CSS class and column
header title for the new column if it's created.

The second interface we add is `GridField_ActionProvider`. This interface is
used as we're providing a custom action for the user to take (`docustomaction`).
This action is triggered when a user clicks on the button defined in
`getColumnContent()`. As with the `GridField_ColumnProvider` interface, by adding
this interface we have to define two methods to describe the behavior of the
action:

- [`getActions`](api:SilverStripe\Forms\GridField\GridField_ActionProvider::getActions()) - returns an array of all the custom actions we want this class to
handle
- [`handleAction`](api:SilverStripe\Forms\GridField\GridField_ActionProvider::handleAction()) - contains the logic for performing the
specific action

Inside `handleAction()` we have access to the current `GridField` instance, and the record row
through the `$arguments`. If your column provides more than one action (e.g two
links) both actions will be handled through the one `handleAction` method. The
called action is available as the `$actionName` argument.

To finish off our basic example, the `handleAction()` method simply returns a
message to the user interface indicating a successful message.

## Add the `GridField` custom action to the `GridFieldConfig` {#add-action-to-config}

To add this new action to the `GridField`, add
a new instance of the class to the [`GridFieldConfig`](api:SilverStripe\Forms\GridField\GridFieldConfig) object.
The [`GridField` documentation](/developer_guides/forms/field_types/gridfield)
has more information about
manipulating the `GridFieldConfig` instance if required.

```php
// option 1: creating a new GridField with the CustomAction
$config = GridFieldConfig::create();
$config->addComponent(GridFieldCustomAction::create());

$gridField = GridField::create('Teams', 'Teams', $this->Teams(), $config);

// option 2: adding the CustomAction to an existing GridField
$gridField->getConfig()->addComponent(GridFieldCustomAction::create());
```

For documentation on adding a Component to a `GridField` created by `ModelAdmin`
please view the relevant [`ModelAdmin` documentation`](/developer_guides/customising_the_admin_interface/modeladmin/#altering-the-modeladmin-gridfield-or-form).

## Add a `GridField` custom action to the `GridField_ActionMenu` {#implement-gridfield-actionmenuitem}

For an action to be included in the action menu dropdown, which appears on each row if `GridField_ActionMenu` is included in the `GridFieldConfig`, it must implement `GridField_ActionMenuItem` and relevant `get` functions to provide information to the frontend react action menu component.

```php
namespace App\Form\GridField;

use SilverStripe\Forms\GridField\AbstractGridFieldComponent;
use SilverStripe\Forms\GridField\GridField_ActionMenuItem;
use SilverStripe\Forms\GridField\GridField_ActionProvider;
use SilverStripe\Forms\GridField\GridField_ColumnProvider;
use SilverStripe\Forms\GridField\GridField_FormAction;

class GridFieldCustomAction extends AbstractGridFieldComponent implements
    GridField_ColumnProvider,
    GridField_ActionProvider,
    GridField_ActionMenuItem
{
    public function getTitle($gridField, $record, $columnName)
    {
        return 'Custom action';
    }

    public function getExtraData($gridField, $record, $columnName)
    {
        $field = $this->getCustomAction($gridField, $record);
        if ($field) {
            return array_merge($field->getAttributes(), [
                'classNames' => 'font-icon-circle-star action-detail',
            ]);
        }

        return [];
    }

    public function getGroup($gridField, $record, $columnName)
    {
        return GridField_ActionMenuItem::DEFAULT_GROUP;
    }

    public function getColumnContent()
    {
        return $this->getCustomAction()?->Field();
    }

    private function getCustomAction($gridField, $record)
    {
        if (!$record->hasMethod('canEdit') || !$record->canEdit()) {
            return;
        }

        return GridField_FormAction::create(
            $gridField,
            'CustomAction' . $record->ID,
            'Custom action',
            'docustomaction',
            ['RecordID' => $record->ID]
        )->addExtraClass(
            'action-menu--handled btn btn-outline-dark'
        );
    }

    // ...
}
```

Implement the other methods as per [Basic GridField custom action boilerplate](#custom-action-boilerplate) above.

The `GridField_ActionMenuItem` interface gives us three more methods we need to implement:

- [`getTitle()`](api:SilverStripe\Forms\GridField\GridField_ActionMenuItem::getTitle()) - returns the title for this menu item
- [`getExtraData()`](api:SilverStripe\Forms\GridField\GridField_ActionMenuItem::getExtraData()) - returns any extra data that could go in to the schema that the menu generates
- [`getGroup()`](api:SilverStripe\Forms\GridField\GridField_ActionMenuItem::getGroup()) - returns the group this menu item will belong to

Note that the classes in the array returned by `getExtraData()` are used in the action button within the collapsible action menu, while the classes passed into `addExtraClass()` on the `GridField_FormAction` instance are used for the fallback button, which will be rendered if the `GridFieldConfig` doesn't contain a `GridField_ActionMenu`. The `action-menu--handled` class in particular is important, as that class is used to hide the fallback button if the `GridField_ActionMenu` is available.

## Related

- [GridField Reference](/developer_guides/forms/field_types/gridfield)
- [ModelAdmin: A UI driven by GridField](/developer_guides/customising_the_admin_interface/modeladmin)
