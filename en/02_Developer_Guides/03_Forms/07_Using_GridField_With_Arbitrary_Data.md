---
title: Using GridField with Arbitrary Data
summary: Details about using the GridField class for managing data which isn't represented by DataObject models.
icon: table
---

# Using `GridField` with arbitrary data

[`GridField`](api:SilverStripe\Forms\GridField\GridField) is often used for displaying and editing `DataObject` records - but it can be used with other data as well. You might have data that is pulled from an API for example, which you want to display in the admin area of your Silverstripe CMS project.

> [!NOTE]
> This document assumes you're familiar with `GridField` - see the [`GridField` documentation](/developer_guides/forms/field_types/gridfield/) for information about using `GridField`.

Data which isn't represented by `DataObject` records can come in two forms:

- truely arbitrary data wrapped in [`ArrayData`](api:SilverStripe\Model\ArrayData)
- data which has some specific class to represent it.

Both are supported by `GridField`, provided the class representing the data is some subclass of [`ModelData`](api:SilverStripe\Model\ModelData).

Some grid field components may require specific information, such as which columns to display or how to represent the data in a form. Depending on how you're representing your data, you might need to call specific methods on those components to pass that information in, or you might instead choose to implement methods in your data representation class which the components can call to get that information.

## Representing data with `ArrayData`

Regardless of how you get your data, whether it's from a web API or some other source, you'll need to store it in an `ArrayList`. For best results, each record should also be explicitly instantiated as an `ArrayData` object in the list.

> [!TIP]
> The `ID` field shown here isn't necessary if you only want to view the records as rows in the `GridField`, but if you want to be able to view *each* record in a read-only form view, the `ID` field is mandatory.
>
> See [viewing data in a form](#arraydata-view) for more information.

```php
use SilverStripe\Model\ArrayData;
use SilverStripe\Model\List\ArrayList;

$list = ArrayList::create([
    ArrayData::create([
        'ID' => 1,
        'FieldName' => 'This is an item',
    ]),
    ArrayData::create([
        'ID' => 2,
        'FieldName' => 'This is a different item',
    ]),
]);
```

### Displaying data as rows in a `GridField` {#arraydata-display-as-rows}

For displaying your data as rows in a `GridField`, you can rely on the default `GridFieldConfig` object that the field will build for itself, with some small changes.

You'll need to tell the `GridField` which fields in your data should be displayed in the grid view. You do this by passing an associative array of field names to labels into [`GridFieldDataColumns::setDisplayFields()`](SilverStripe\Forms\GridField\GridFieldDataColumns::setDisplayFields()).

```php
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldDataColumns;

$gridField = GridField::create('MyData', 'My data', $list);
$columns = $gridField->getConfig()->getComponentByType(GridFieldDataColumns::class);
$columns->setDisplayFields([
    'FieldName' => 'Column Header Label',
]);
```

If you don't want filtering functionality, you'll also need to remove the [`GridFieldFilterHeader`](api:SilverStripe\Forms\GridField\GridFieldFilterHeader) component from the gridfield:

```php
use SilverStripe\Forms\GridField\GridFieldFilterHeader;
$gridField->getConfig()->removeComponentsByType(GridFieldFilterHeader::class);
```

### Filtering data {#arraydata-filter}

If you want to be able to filter your `GridField`, you will need to tell the `GridField` which fields to filter against and how to do so. The `GridFieldFilterHeader` uses a [`SearchContext`](api:SilverStripe\ORM\Search\SearchContext) implementation to do most of the heavy lifting.

The [`BasicSearchContext`](api:SilverStripe\ORM\Search\BasicSearchContext) is designed to be used for data that isn't represented by `DataObject` records.

```php
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridFieldFilterHeader;
use SilverStripe\Forms\HiddenField;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\Search\BasicSearchContext;

// Instantiate a BasicSearchContext and tell it which fields to search against
$searchContext = BasicSearchContext::create(null);
$searchFields = [
    HiddenField::create(BasicSearchContext::config()->get('general_search_field_name')),
    TextField::create('FieldName', 'Search Field Label'),
];
// Pass the BasicSearchContext into the GridFieldFilterHeader component
$searchContext->setFields(FieldList::create($searchFields));
$gridField->getConfig()->getComponentByType(GridFieldFilterHeader::class)->setSearchContext($searchContext);
```

### Exporting data {#arraydata-export}

If you want to export or print your data, you don't have to do anything special - just make sure to include the `GridFieldExportButton` and `GridFieldPrintButton` components.

```php
use SilverStripe\Forms\GridField\GridFieldExportButton;
use SilverStripe\Forms\GridField\GridFieldPrintButton;
$gridField->getConfig()->addComponents([
    GridFieldExportButton::create('buttons-before-left'),
    GridFieldPrintButton::create('buttons-before-left'),
]);
```

These will both use the field list you [passed into `GridFieldDataColumns`](#arraydata-display-as-rows) to know which fields they should use - though you can explicitly call [`GridFieldExportButton::setExportColumns()`](api:SilverStripe\Forms\GridField\GridFieldExportButton::setExportColumns()) and [`GridFieldPrintButton::setPrintColumns()`](api:SilverStripe\Forms\GridField\GridFieldPrintButton::setPrintColumns()) if you want to export/print different columns than those displayed in the grid view.

### Viewing data in a form {#arraydata-view}

For data to be viewed in a read-only form, each record in the list must have an `ID` field, and the value of that field must be a positive integer. This is used in the URL for the form. Without it, the gridfield has no way to know which record it should be displaying in the form.

You'll need to add a `GridFieldDetailForm` component to the `GridField` and tell it how to represent your data by passing a [`FieldList`](api:SilverStripe\Forms\FieldList) into [`GridFieldDetailForm::setFields()`](api:SilverStripe\Forms\GridField\GridFieldDetailForm::setFields()).

> [!TIP]
> Because `ArrayData` doesn't implement a `canEdit()` method, the form will be implicitly turned into a read-only form for you. You don't need to worry about passing in read-only form fields.

```php
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\GridField\GridFieldDetailForm;
use SilverStripe\Forms\GridField\GridFieldViewButton;
use SilverStripe\Forms\HiddenField;
use SilverStripe\Forms\TextField;

$detailForm = GridFieldDetailForm::create();
$detailForm->setFields(FieldList::create([
    HiddenField::create('ID'),
    TextField::create('FieldName', 'View Field Label'),
]));
$gridField->getConfig()->addComponents([
    GridFieldViewButton::create(),
    $detailForm,
]);
```

## Representing data in your own class

As mentioned [in the preamble above](#using-gridfield-with-arbitrary-data), the class representing your data must be a subclass of `ModelData` in order for it to be used in a `GridField`.

Representing data in your own class adds some complexity, but empowers content authors to create, update and delete entries via the `GridField`.

Note that all of the methods that this documentation implements can be ommitted, with exception of the [editing data in a form](#custom-edit) section.
However, if you omit these method implementations, you must instead pass the required information through to the relevant `GridField` components as shown in [representing data with `ArrayData`](#representing-data-with-arraydata) above.

### Displaying data as rows in a `GridField` {#custom-display-as-rows}

To represent your data as rows in a `GridField`, you can rely on the default `GridFieldConfig` object that the field will build for itself. If you implement a `summaryFields()` method in your data class, the `GridField` will call that method to find out what fields it should display.

> [!TIP]
> The `ID` field shown here isn't necessary if you only want to view/edit the records as rows in the `GridField`, but if you want to be able to view *each* record in a read-only form view, the `ID` field is mandatory.
>
> See [viewing data in a form](#custom-view) for more information.

```php
namespace App\Data;

use SilverStripe\Model\ModelData;

class DataRepresentation extends ModelData
{
    private int $id;

    private string $title;

    public function __construct(int $id, string $title)
    {
        $this->id = $id;
        $this->title = $title;
    }

    public function getID(): int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * Used to detect gridfield columns.
     * @return string[] Associative array where the keys are field names and the values are display labels.
     */
    public function summaryFields(): array
    {
        return ['Title' => 'Title'];
    }
}
```

```php
use App\Data\DataRepresentation;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Model\List\ArrayList;

$list = ArrayList::create([
    DataRepresentation::create(1, 'This is an item'),
    DataRepresentation::create(2, 'This is a different item'),
]);

$gridField = GridField::create('MyData', 'My data', $list);
```

If you don't want filtering functionality, you'll also need to remove the [`GridFieldFilterHeader`](api:SilverStripe\Forms\GridField\GridFieldFilterHeader) component from the gridfield:

```php
use SilverStripe\Forms\GridField\GridFieldFilterHeader;
$gridField->getConfig()->removeComponentsByType(GridFieldFilterHeader::class);
```

### Filtering data {#custom-filter}

If you want to be able to filter your `GridField`, you will need to tell the `GridField` which fields to filter against and how to do so. As shown in [filtering `ArrayData`](#arraydata-filter) above, you use a `BasicSearchContext` to do the heavy lifting here - but we don't have to explicitly pass it to the `GridField` if we implement the `getDefaultSearchContext()` method.

What's more, we don't have to pass the search fields into the `BasicSearchContext` instance either if we implement a `scaffoldSearchFields()` method.

> [!TIP]
> You can optionally implement the `i18n_singular_name()` method to return a localised string to represent the plural name of this model. This is used in the filter header as the placeholder text for the general search field.

```php
namespace App\Data;

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HiddenField;
use SilverStripe\Forms\TextField;
use SilverStripe\Model\ModelData;
use SilverStripe\ORM\Search\BasicSearchContext;

class DataRepresentation extends ModelData
{
    // ...

    public function getDefaultSearchContext()
    {
        return BasicSearchContext::create(static::class);
    }

    public function scaffoldSearchFields()
    {
        return FieldList::create([
            HiddenField::create(BasicSearchContext::config()->get('general_search_field_name')),
            TextField::create('Title', 'Title'),
        ]);
    }

    // ...
}
```

No changes are required to the `GridField` components, assuming you didn't remove the `GridFieldFilterHeader` component.

> [!TIP]
> The `BasicSearchContext` respects some (*but not all*) [`$searchable_fields` configuration options](/developer_guides/model/scaffolding/#searchable-fields), so you can implement a `searchableFields()` method in your class to further customise the `GridField` filtering experience.

### Exporting data {#custom-export}

Just like with `ArrayData`, to export or print data we don't need to do anything more than ensure the relevant components are in the `GridField` config.

```php
use SilverStripe\Forms\GridField\GridFieldExportButton;
use SilverStripe\Forms\GridField\GridFieldPrintButton;
$gridField->getConfig()->addComponents([
    GridFieldExportButton::create('buttons-before-left'),
    GridFieldPrintButton::create('buttons-before-left'),
]);
```

### Viewing data in a form {#custom-view}

The same requirement of a positive integer `ID` field as described in [viewing `ArrayData` in a form](#arraydata-view) above applies here too.

If the class representing your data has a `getCMSFields()` method, the return value of that method will be used for the fields displayed in form.

If your class doesn't implement a `canEdit()` method, or it does and the method returns `false`, the form will be read-only.

> [!TIP]
> You can optionally implement the `i18n_plural_name()` method to return a localised string to represent the singular name of this model. This is used in the add button, breadcrumbs, and toasts.

```php
namespace App\Data;

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HiddenField;
use SilverStripe\Forms\TextField;
use SilverStripe\Model\ModelData;

class DataRepresentation extends ModelData
{
    // ...

    public function getCMSFields()
    {
        return FieldList::create([
            HiddenField::create('ID'),
            TextField::create('FieldName', 'View Field Label'),
        ]);
    }

    // ...
}
```

You will need to have `GridFieldDetailForm` and `GridFieldViewButton` components in your `GridField` config in order to access the form view.

```php
use SilverStripe\Forms\GridField\GridFieldDetailForm;
use SilverStripe\Forms\GridField\GridFieldViewButton;

$gridField->getConfig()->addComponents([
    GridFieldViewButton::create(),
    GridFieldDetailForm::create(),
]);
```

### Editing data in a form {#custom-edit}

There are a few extra pre-requisites to allow content authors to edit data.

The class representing your data *must* implement [`DataObjectInterface`](api:SilverStripe\ORM\DataObjectInterface) so that your records can be edited.

For new records, the `write()` method *must* set the `ID` field on the record, so that the user is correctly redirected to the edit form of the new record after saving it.

Records with no `ID` field or which have a non-numeric value for their `ID` field are considered new (unsaved) records.

> [!TIP]
> If you have specific validation rules you want to apply, you can also implement a `getCMSCompositeValidator()` method as described in [validation in the CMS](/developer_guides/forms/validation/#validation-in-the-cms).

```php
namespace App\Data;

use LogicException;
use SilverStripe\Model\ModelData;
use SilverStripe\ORM\DataObjectInterface;

class DataRepresentation extends ModelData implements DataObjectInterface
{
    // ...

    public function write()
    {
        // Do whatever you need to write the record - e.g. send it to a web API

        // You MUST set the ID on newly created records
        if (!$this->ID) {
            $this->ID = $idFromApi;
        }
    }

    public function delete()
    {
        if (!$this->ID) {
            throw new LogicException('delete() called on a record without an ID');
        }

        // Do whatever you need to delete the record - e.g. send a deletion request to a web API

        $this->ID = 0;
    }

    /**
     * Sets the value from the form.
     * Since the data comes straight from a form it can't be trusted and you should make sure
     * to validate / escape it as appropriate.
     */
    public function setCastedField($fieldName, $val)
    {
        $this->$fieldName = $val;
    }

    /**
     * Determines if the current logged in user is allowed to edit this record.
     */
    public function canEdit()
    {
        return true;
    }

    /**
     * Determines if the current logged in user is allowed to create new records.
     *
     * This method is optional - you only need this if you will allow creating new records.
     * If the method isn't implemented, it's assumed that nobody is allowed to create them.
     */
    public function canCreate()
    {
        return true;
    }

    /**
     * Determines if the current logged in user is allowed to delete records.
     *
     * This method is optional - you only need this if you will allow deleting records.
     * If the method isn't implemented, it's assumed that nobody is allowed to delete them.
     */
    public function canDelete()
    {
        return true;
    }

    // ...
}
```

You should add a [`GridFieldEditButton`](api:SilverStripe\Forms\GridField\GridFieldEditButton) component to your `GridField` config.

```php
use SilverStripe\Forms\GridField\GridFieldEditButton;
$gridField->getConfig()->addComponent(GridFieldEditButton::create());
```

You can also enable creating new records and deleting records by adding the [`GridFieldAddNewButton`](api:SilverStripe\Forms\GridField\GridFieldAddNewButton) and [`GridFieldDeleteAction`](api:SilverStripe\Forms\GridField\GridFieldDeleteAction) components to your `GridField` config.

> [!TIP]
> At this point your `GridField` config is essentially the same as a [`GridFieldConfig_RecordEditor`](api:SilverStripe\Forms\GridField\GridFieldConfig_RecordEditor) - so you could set up your `GridField` like so:
>
> ```php
> use SilverStripe\Forms\GridField\GridField;
> use SilverStripe\Forms\GridField\GridFieldConfig_RecordEditor;
> $gridField = GridField::create('MyData', 'My data', $list, GridFieldConfig_RecordEditor::create());
> ```
