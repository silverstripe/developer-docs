---
title: Create a GridField Component
summary: Customise your GridField with a variety of add-ons.
icon: table
---

# Create a GridField Component

A single component often uses a number of interfaces. It is good practice for your custom
components to subclass the [`AbstractGridFieldComponent`](api:SilverStripe\Forms\GridField\AbstractGridFieldComponent) class to ensure they behave the same
way as built-in components (e.g. are [`Injectable`](api:SilverStripe\Core\Injector\Injectable)).

See the [gridfield documentation](../field_types/gridfield) for more information about how components are used.

## GridField_ActionMenuItem

A button that will perform some action on a record. Often also implement `GridField_ActionProvider`.

Example:

- Buttons to manipulate the versioned state of a record (archive, publish, etc)

See [Add a GridField custom action to the `GridField_ActionMenu`](./create_a_gridfield_actionprovider#$implement-gridfield-actionmenuitem) for an example of implementing this component.

## GridField_ActionMenuLink

A more specific kind of `GridField_ActionMenuItem` which acts as a link to navigate the user somewhere else rather than performing an action in situ.

Examples:

- A link to go edit or view a record
- A link to view the record directly on the website's front-end

## GridField_ActionProvider

Action providers run actions. Action providers often also implement `GridField_ActionMenuItem`.

Examples:

- A delete action provider that deletes a DataObject.
- An export action provider that will export the current list to a CSV file.

See [Basic GridField custom action boilerplate](./create_a_gridfield_actionprovider#custom-action-boilerplate) for an example of implementing this component.

## GridField_ColumnProvider

Add a new column to the table display body, or modify existing columns. Used once per record/row.

Examples:

- A data columns provider that displays data from the list in rows and columns.
- A delete button column provider that adds a delete button at the end of the row

## GridField_DataManipulator

Modifies the data list. In general, the data manipulator will make use of `GridState` variables
to decide how to modify the data list.

Examples:

- A paginating data manipulator can apply a limit to a list (show only 20 records)
- A sorting data manipulator can sort the Title in a descending order.

## GridField_HTMLProvider

Provides HTML for the header/footer rows in the table or before/after the template.

Examples:

- A header html provider displays a header before the table
- A pagination html provider displays pagination controls under the table
- A filter html fields displays filter fields on top of the table
- A summary html field displays sums of a field at the bottom of the table

## GridField_SaveHandler

Adds additional functionality when the gridfield's `saveInto()` method is called.

Examples:

- Making a `GridField` inline-editable
- Adding extra data or performing other operations based on the context a record is being saved in

## GridField_StateProvider

Components which provide some default state implement this interface.

Examples:

- Providing a sort order
- Filtering the list
- Adding pagination functionality

## GridField_URLHandler

Sometimes an action isn't enough, we need to provide additional support URLs for the grid. It 
has a list of URL's that it can handle and the GridField passes request on to URLHandlers on matches.

Examples:

- A pop-up form for editing a record's details.
- JSON formatted data used for javascript control of the gridfield.
