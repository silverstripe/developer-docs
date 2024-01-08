---
title: GridField
summary: How to use the GridField class for managing tabular data.
icon: table
---

# `GridField`

[GridField](api:SilverStripe\Forms\GridField\GridField) is Silverstripe CMS's implementation of data grids. The main purpose of this field type is to display
tabular data in a format that is easy to view and modify. It can be thought of as a HTML table with some tricks.

Usually `GridField` is used with `DataObject` records - but it can be used with data that isn't represented by `DataObject` records as well.

See [using `GridField` with arbitrary data](/developer_guides/forms/using_gridfield_with_arbitrary_data/) for more information.

[info]
`GridField` powers the automated data UI of [ModelAdmin](api:SilverStripe\Admin\ModelAdmin). For more information about `ModelAdmin` see the
[Customizing the CMS](/developer_guides/customising_the_admin_interface) guide.
[/info]

```php
use SilverStripe\Forms\GridField\GridField;
// ...

$field = GridField::create($name, $title, $list);
```

[hint]
GridField can only be used with `$list` data sets that are of the type `SS_List` such as `DataList` or `ArrayList`.
[/hint]

Each `GridField` is built from a number of components grouped into the [GridFieldConfig](api:SilverStripe\Forms\GridField\GridFieldConfig). Without any components,
a `GridField` has almost no functionality. The `GridFieldConfig` instance and the attached [GridFieldComponent](api:SilverStripe\Forms\GridField\GridFieldComponent) are
responsible for all the user interactions including formatting data to be readable, modifying data and performing any
actions such as deleting records.

```php
// app/src/PageType/MyPage.php
namespace App\PageType;

use Page;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Forms\GridField\GridField;

class MyPage extends Page
{
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->addFieldToTab(
            'Root.Pages',
            GridField::create('Pages', 'All pages', SiteTree::get())
        );

        return $fields;
    }
}
```

This will display a bare bones `GridField` instance under `Pages` tab in the CMS. As we have not specified the
`GridFieldConfig` configuration, the default configuration is an instance of [GridFieldConfig_Base](api:SilverStripe\Forms\GridField\GridFieldConfig_Base).
See [Bundled `GridFieldConfig`](#bundled-gridfieldconfig) below for more information about this class.

The configuration of those `GridFieldComponent` instances and the addition or subtraction of components is done through
the `getConfig()` method on `GridField`.

```php
// app/src/PageType/MyPage.php
namespace App\PageType;

use Page;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldDataColumns;

class MyPage extends Page
{
    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        $fields->addFieldToTab(
            'Root.Pages',
            $grid = GridField::create('Pages', 'All pages', SiteTree::get())
        );

        // GridField configuration
        $config = $grid->getConfig();

        // Modification of existing components can be done by fetching that component.
        // Consult the API documentation for each component to determine the configuration
        // you can do.
        $dataColumns = $config->getComponentByType(GridFieldDataColumns::class);

        $dataColumns->setDisplayFields([
            'Title' => 'Title',
            'Link' => 'URL',
            'LastEdited' => 'Changed',
        ]);

        return $fields;
    }
}
```

With the `GridFieldConfig` instance, we can modify the behavior of the `GridField`.

```php
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig;
use SilverStripe\Forms\GridField\GridFieldDataColumns;

// ...

// `GridFieldConfig::create()` will create an empty configuration (no components).
$config = GridFieldConfig::create();

// add a component
$config->addComponent(GridFieldDataColumns::create());

// Update the GridField with our custom configuration
$gridField->setConfig($config);
// Or, more likely, create a new gridfield using our custom configuration
$gridField = GridField::create('Pages', 'All pages', SiteTree::get(), $config);
```

`GridFieldConfig` provides a number of methods to make setting the configuration easier. We can insert a component
before another component by passing the second parameter.

```php
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldFilterHeader;

// ...

$config->addComponent(GridFieldFilterHeader::create(), GridFieldDataColumns::class);
```

We can add multiple components in one call.

```php
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldToolbarHeader;

// ...

$config->addComponents(
    GridFieldDataColumns::create(),
    GridFieldToolbarHeader::create()
);
```

Or, remove a component.

```php
use SilverStripe\Forms\GridField\GridFieldDeleteAction;

// ...

$config->removeComponentsByType(GridFieldDeleteAction::class);
// or if we have a specific instance to remove:
$config->removeComponent($componentInstance);
```

Fetch a component to modify it later on.

```php
use SilverStripe\Forms\GridField\GridFieldFilterHeader;

// ...

$component = $config->getComponentByType(GridFieldFilterHeader::class)
```

Here is a list of some of the components bundled with the core framework. See the
[API documentation](api:SilverStripe\Forms\GridField)
for a more complete list.

- [GridField_ActionMenu](api:SilverStripe\Forms\GridField\GridField_ActionMenu)
- [GridFieldToolbarHeader](api:SilverStripe\Forms\GridField\GridFieldToolbarHeader)
- [GridFieldSortableHeader](api:SilverStripe\Forms\GridField\GridFieldSortableHeader)
- [GridFieldFilterHeader](api:SilverStripe\Forms\GridField\GridFieldFilterHeader)
- [GridFieldDataColumns](api:SilverStripe\Forms\GridField\GridFieldDataColumns)
- [GridFieldDeleteAction](api:SilverStripe\Forms\GridField\GridFieldDeleteAction)
- [GridFieldViewButton](api:SilverStripe\Forms\GridField\GridFieldViewButton)
- [GridFieldEditButton](api:SilverStripe\Forms\GridField\GridFieldEditButton)
- [GridFieldExportButton](api:SilverStripe\Forms\GridField\GridFieldExportButton)
- [GridFieldPrintButton](api:SilverStripe\Forms\GridField\GridFieldPrintButton)
- [GridFieldPaginator](api:SilverStripe\Forms\GridField\GridFieldPaginator)
- [GridFieldDetailForm](api:SilverStripe\Forms\GridField\GridFieldDetailForm)

Many more components are provided by third-party modules and extensions.

## Bundled `GridFieldConfig`

As a shortcut, `GridFieldConfig` subclasses can define a list of `GridFieldComponent` objects to use. This saves
developers manually adding each component.

### `GridFieldConfig_Base`

A simple read-only and paginated view of records with sortable and searchable headers.

```php
use SilverStripe\Forms\GridField\GridFieldConfig_Base;

$config = GridFieldConfig_Base::create();
$gridField->setConfig($config);

// Is the same as adding the following components..
// ... GridFieldToolbarHeader::create()
// ... GridFieldSortableHeader::create()
// ... GridFieldFilterHeader::create()
// ... GridFieldDataColumns::create()
// ... GridFieldPageCount::create('toolbar-header-right')
// ... GridFieldPaginator::create($itemsPerPage)
```

### `GridFieldConfig_RecordViewer`

Similar to `GridFieldConfig_Base` with the addition support of the ability to view a [`GridFieldDetailForm`](api:SilverStripe\Forms\GridField\GridFieldDetailForm) containing
a read-only view of the data record.

[info]
Each record in the list must have an `ID` field, and the value of that field must be a positive integer.

If the class representing your data has a `getCMSFields()` method, the return value of that method will be used for the fields displayed in the read-only view.
Otherwise, you'll need to pass in a [`FieldList`](api:SilverStripe\Forms\FieldList) to [`GridFieldDetailForm::setFields()`](api:SilverStripe\Forms\GridField\GridFieldDetailForm::setFields()).
[/info]

```php
use SilverStripe\Forms\GridField\GridFieldConfig_RecordViewer;

$config = GridFieldConfig_RecordViewer::create();
$gridField->setConfig($config);

// Same as GridFieldConfig_Base with the addition of
// ... GridFieldViewButton::create(),
// ... GridFieldDetailForm::create()
```

### `GridFieldConfig_RecordEditor`

Similar to `GridFieldConfig_RecordViewer` with the addition support to edit or delete each of the records.

[info]
Each record in the list must have an `ID` field, and the value of that field must be a positive integer.

If the class representing your data has a `getCMSFields()` method, the return value of that method will be used for the fields displayed in the read-only view.
Otherwise, you'll need to pass in a [`FieldList`](api:SilverStripe\Forms\FieldList) to [`GridFieldDetailForm::setFields()`](api:SilverStripe\Forms\GridField\GridFieldDetailForm::setFields()).
[/info]

[warning]
The class representing your data *must* implement [`DataObjectInterface`](api:SilverStripe\ORM\DataObjectInterface) so that your records can be edited.

See [using `GridField` with arbitrary data](/developer_guides/forms/using_gridfield_with_arbitrary_data/) for more information.
[/warning]

[alert]
Permission control for editing and deleting the record uses the `canEdit()` and `canDelete()` methods on the class that represents your data.
[/alert]

```php
use SilverStripe\Forms\GridField\GridFieldConfig_RecordEditor;

$config = GridFieldConfig_RecordEditor::create();
$gridField->setConfig($config);

// Same as GridFieldConfig_RecordViewer with the addition of
// .. GridField_ActionMenu::create(),
// .. GridFieldAddNewButton::create(),
// .. GridFieldEditButton::create(),
// .. GridFieldDeleteAction::create()
// and without the GridFieldViewButton
```

### `GridFieldConfig_RelationEditor`

Similar to `GridFieldConfig_RecordEditor`, but adds features to work on a record's has-many or many-many relationships.
As such, it expects the list used with the `GridField` to be a instance of `RelationList`.

```php
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;

// ...

$config = GridFieldConfig_RelationEditor::create();
$gridField->setConfig($config);
```

This configuration adds the ability to searched for existing records and add a relationship
(`GridFieldAddExistingAutocompleter`).

Records created or deleted through the `GridFieldConfig_RelationEditor` automatically update the relationship in the
database.

## `GridField_ActionMenu`

The `GridField_ActionMenu` component provides a dropdown menu which automatically bundles GridField actions into a react based dropdown. It is included by default on `GridFieldConfig_RecordEditor` and `GridFieldConfig_RelationEditor` configs.

To add it to a `GridField`, add the `GridField_ActionMenu` component and any action(s) that implement [`GridField_ActionMenuItem`](api:SilverStripe\Forms\GridField\GridField_ActionMenuItem) (such as `GridFieldEditButton` or `GridFieldDeleteAction`) to the `GridFieldConfig`.

```php
use SilverStripe\Forms\GridField\GridFieldConfig;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldEditButton;
use SilverStripe\Forms\GridField\GridField_ActionMenu;

// `GridFieldConfig::create()` will create an empty configuration (no components).
$config = GridFieldConfig::create();

// add a component
$config->addComponent();

$config->addComponents(
    GridFieldDataColumns::create(),
    GridFieldEditButton::create(),
    GridField_ActionMenu::create()
);

// Update the GridField with our custom configuration
$gridField->setConfig($config);
```

## `GridFieldDetailForm`

The `GridFieldDetailForm` component drives the record viewing and editing form. By default it takes its fields from the `getCMSFields()` method
(e.g. [`DataObject->getCMSFields()`](api:SilverStripe\ORM\DataObject::getCMSFields())) method but can be customised to accept different fields via the
[GridFieldDetailForm::setFields()](api:SilverStripe\Forms\GridField\GridFieldDetailForm::setFields()) method.

```php
use App\Forms\FieldList;
use App\Forms\TextField;
use SilverStripe\Forms\GridField\GridFieldDetailForm;

$form = $gridField->getConfig()->getComponentByType(GridFieldDetailForm::class);
$form->setFields(FieldList::create(
    TextField::create('Title')
));
```

### `many_many_extraFields`

The component also has the ability to load and save data stored on join tables when two records are related via a
`many_many` relationship, as defined through `$many_many_extraFields` configuration (see [many_many relationships](/developer_guides/model/relations/#many-many)).
While loading and saving works transparently, you need to add the necessary fields manually.

These fields aren't included in the `getCMSFields()` scaffolding, and you shouldn't include them in the `getCMSFields()` implementation
for the model being displayed in the `GridField` since that model could be used in other contexts as well where the extra fields
aren't available.

These extra fields act like usual form fields when displayed in the context of a `GridField`.
For the field list being passed into the `GridFieldDetailForm` you need to "namespace"
the fields in order for the field value to be saved, and to avoid clashes with the other form fields.

Using the field name directly without the namespace notation will allow you to *see* the value, but it won't save
the value when submitting the form. It is recommended that you always use the namespaced notation when you expect
to be able to save the `$many_many_extraFields` data.

The namespace notation is `ManyMany[<extradata-field-name>]`, so for example `ManyMany[MyExtraField]`.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $db = [
        'Name' => 'Varchar',
    ];

    private static $belongs_many_many = [
        'Players' => Player::class,
    ];
}
```

```php
namespace App\Model;

use SilverStripe\Forms\GridField\GridField;
use SilverStripe\Forms\GridField\GridFieldConfig_RelationEditor;
use SilverStripe\Forms\GridField\GridFieldDataColumns;
use SilverStripe\Forms\GridField\GridFieldDetailForm;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $db = [
        'Name' => 'Varchar',
    ];

    private static $many_many = [
        'Teams' => Team::class,
    ];

    private static $many_many_extraFields = [
        'Teams' => [
            'Position' => 'Varchar',
        ],
    ];

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();

        if ($this->ID) {
            $singletonTeam = singleton(Team::class);
            $teamEditFields = $singletonTeam->getCMSFields();
            $teamEditFields->addFieldToTab(
                'Root.Main',
                // The "ManyMany[<extradata-name>]" convention is necessary here, because this will be passed
                // into the GridFieldDetailForm
                TextField::create('ManyMany[Position]', 'Current Position')
            );

            // For summary fields, the "ManyMany[<extradata-name>]" convention won't work (and isn't necessary),
            // since this isn't passed into the GridFieldDetailForm
            $teamSummaryFields = array_merge($singletonTeam->summaryFields(), ['Position' => 'Current Position']);

            $config = GridFieldConfig_RelationEditor::create();
            $config->getComponentByType(GridFieldDetailForm::class)->setFields($teamEditFields);
            $config->getComponentByType(GridFieldDataColumns::class)->setDisplayFields($teamSummaryFields);

            $gridField = GridField::create('Teams', 'Teams', $this->Teams(), $config);
            $fields->findOrMakeTab('Root.Teams')->replaceField('Teams', $gridField);
        }

        return $fields;
    }
}
```

## Flexible area assignment through fragments

`GridField` layouts can contain many components other than the table itself, for example a search bar to find existing
relations, a button to add those, and buttons to export and print the current data. The `GridField` has certain defined
areas called `fragments` where these components can be placed.

The goal is for multiple components to share the same space, for example a header row. The built-in components:

- `header`/`footer`: Renders in a `<thead>`/`<tfoot>`, should contain table markup
- `before`/`after`: Renders before/after the actual `<table>`
- `buttons-before-left`/`buttons-before-right`:
Renders in a shared row before the table. Requires [GridFieldButtonRow](api:SilverStripe\Forms\GridField\GridFieldButtonRow).
- `buttons-after-left`/`buttons-after-right`: Similar to the above, but renders after the table.

These built-ins can be used by passing the fragment names into the constructor of various components. Note that some
[GridFieldConfig](api:SilverStripe\Forms\GridField\GridFieldConfig) classes will already have rows added to them. The following example will add a print button at the
bottom right of the table.

```php
use SilverStripe\Forms\GridField\GridFieldButtonRow;
use SilverStripe\Forms\GridField\GridFieldPrintButton;

// ...
$config->addComponent(GridFieldButtonRow::create('after'));
$config->addComponent(GridFieldPrintButton::create('buttons-after-right'));
```

### Creating your own fragments

Fragments are designated areas within a `GridField` which can be shared between component templates. You can define
your own fragments by using a `\$DefineFragment` placeholder in your component's template. This example will simply
create an area rendered before the table wrapped in a simple `<div>`.

[notice]
Please note that in templates, you'll need to escape the dollar sign on `\$DefineFragment`. These are specially
processed placeholders as opposed to native template syntax.
[/notice]

```php
namespace App\Form\GridField;

use SilverStripe\Forms\GridField\AbstractGridFieldComponent;
use SilverStripe\Forms\GridField\GridField_HTMLProvider;

class MyAreaComponent extends AbstractGridFieldComponent implements GridField_HTMLProvider
{
    public function getHTMLFragments($gridField)
    {
        return [
            'before' => '<div class="my-area">$DefineFragment(my-area)</div>',
        ];
    }
}
```

Now you can add other components into this area by returning them as an array from your
[`GridFieldComponent::getHTMLFragments()`](api:SilverStripe\Forms\GridField\GridFieldComponent::getHTMLFragments()) implementation:

```php
namespace App\Form\GridField;

use SilverStripe\Forms\GridField\AbstractGridFieldComponent;
use SilverStripe\Forms\GridField\GridField_HTMLProvider;

class MyShareLinkComponent extends AbstractGridFieldComponent implements GridField_HTMLProvider
{
    public function getHTMLFragments($gridField)
    {
        return [
            'my-area' => '<a href>...</a>',
        ];
    }
}
```

Your new area can also be used by existing components, e.g. the [GridFieldPrintButton](api:SilverStripe\Forms\GridField\GridFieldPrintButton)

```php
use SilverStripe\Forms\GridField\GridFieldPrintButton;

GridFieldPrintButton::create('my-area');
```

## Creating a custom `GridFieldComponent`

Customizing a `GridField` is easy, applications and modules can provide their own `GridFieldComponent` instances to add
functionality. See [How to Create a GridFieldComponent](../how_tos/create_a_gridfieldcomponent).

## Creating a custom `GridField_ActionProvider`

[GridField_ActionProvider](api:SilverStripe\Forms\GridField\GridField_ActionProvider) provides row level actions such as deleting a record. See
[How to Create a GridField_ActionProvider](../how_tos/create_a_gridfield_actionprovider).

## Saving the `GridField` state

`GridState` is a class that is used to contain the current state and actions on the `GridField`. It's transferred
between page requests by being inserted as a hidden field in the form.

The `GridState_Component` sets and gets data from the `GridState`.

## Saving `GridField_FormAction` state

By default state used for performing form actions is saved in the session and tagged with a key like `gf_abcd1234`. In
some cases session may not be an appropriate storage method. The storage method can be configured:

```yml
Name: mysitegridfieldconfig
After: gridfieldconfig
---
SilverStripe\Core\Injector\Injector:
  SilverStripe\Forms\GridField\FormAction\StateStore:
    class: SilverStripe\Forms\GridField\FormAction\AttributeStore
```

The `AttributeStore` class configures action state to be stored in the DOM and sent back on the request that performs
the action. Custom storage methods can be created and used by implementing the `StateStore` interface and configuring
`Injector` in a similar fashion.

## API documentation

- [GridField](api:SilverStripe\Forms\GridField\GridField)
- [GridFieldConfig](api:SilverStripe\Forms\GridField\GridFieldConfig)
- [GridFieldComponent](api:SilverStripe\Forms\GridField\GridFieldComponent)
