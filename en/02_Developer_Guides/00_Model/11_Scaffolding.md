---
title: Building Model and Search Interfaces around Scaffolding
summary: A Model-driven approach to defining your application UI.
icon: hammer
---

# Scaffolding

The ORM already has a lot of information about the data represented by a `DataObject` through its `$db` property, so 
Silverstripe CMS will use that information to scaffold some interfaces. This is done though [FormScaffolder](api:SilverStripe\Forms\FormScaffolder)
to provide reasonable defaults based on the property type (e.g. a checkbox field for booleans). You can then further 
customise those fields as required.

## Form Fields

An example is `DataObject`, Silverstripe CMS will automatically create your CMS interface so you can modify what you need.

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{
    private static $db = [
        'IsActive' => 'Boolean',
        'Title' => 'Varchar',
        'Content' => 'Text'
    ];

    public function getCMSFields() 
    {
        // parent::getCMSFields() does all the hard work and creates the fields for Title, IsActive and Content.
        $fields = parent::getCMSFields();
        $fields->dataFieldByName('IsActive')->setTitle('Is active?');
        
        return $fields;
    }
}
```

To fully customise your form fields, start with an empty FieldList.

```php
public function getCMSFields() 
{
    $fields = FieldList::create(
        TabSet::create("Root",
            Tab::create("Main",
                CheckboxSetField::create('IsActive','Is active?'),
                TextField::create('Title'),
                TextareaField::create('Content')
                    ->setRows(5)
            )
        )
    );
    
    return $fields;
}
```

You can also alter the fields of built-in and module `DataObject` classes through your own 
[DataExtension](/developer_guides/extending/extensions), and a call to `DataExtension->updateCMSFields`.

[info]
`FormField` scaffolding takes [`$field_labels` config](#field-labels) into account as well.
[/info]

## Searchable Fields

The `$searchable_fields` property uses a mixed array format that can be used to further customise your generated admin
system. The default is a set of array values listing the fields.

[info]
`$searchable_fields` will default to use the [`$summary_fields` config](#summary-fields) if not defined. This works fine unless 
your `$summary_fields` config specifies fields that are not stored in the database.
[/info]

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{

   private static $searchable_fields = [
      'Name',
      'ProductCode'
   ];
}
```

### General search field

Tabular views such as `GridField` or `ModalAdmin` include a search bar. As of Silverstripe CMS 4.12, the search bar will search across all of your searchable fields by default. It will return a match if the search terms appear in any of the searchable fields.

#### Exclude fields from the general search

If you have fields which you do _not_ want to be searched with this general search (e.g. date fields which need special consideration), you can mark them as being explicitly excluded by setting `general` to false in the searchable fields configuration for that field:

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{
    private static $searchable_fields = [
        'Name',
        'BirthDate' => [
            'general' => false
        ],
    ];
}
```

#### Customise the general search field name

By default the general search field uses the name "q". If you already use that field name or search query in your [SearchContext](/developer_guides/search/searchcontext), you can change this to whatever name you prefer either globally or per class:

[hint]
If you set `general_search_field_name` to any empty string, general search will be disabled entirely. Instead, the first field in your searchable fields configuration will be used, which was the default behaviour prior to Silverstripe CMS 4.12.
[/hint]

**Globally change the general search field name via yaml config**
```yml
SilverStripe\ORM\DataObject:
  general_search_field_name: 'my_general_field_name'
```

**Customise the general search field name via yaml _or_ php config**
```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{
    private static string $general_search_field_name = 'my_general_field_name';
}
```

#### Specify a search filter for general search

By default, the general search will search across your fields using a [PartialMatchFilter](api:SilverStripe\ORM\Filters\PartialMatchFilter) regardless of what filters you have [specified for those fields](#specify-a-form-field-or-search-filter).

You can configure this to be a specific filter class, or else disable the general search filter. Disabling the filter will result in the filters you have specified for each field being used when searching against that field in the general search.

Like the general search field name, you can set this either globally or per class:

**Globally change the general search filter via yaml config**
```yml
# use a specific filter
SilverStripe\ORM\DataObject:
  general_search_field_filter: 'SilverStripe\ORM\Filters\EndsWithFilter'

# or disable the filter to fall back on individual fields' filters
SilverStripe\ORM\DataObject:
  general_search_field_filter: ''
```

**Customise the general search filter via yaml _or_ php config**
```php
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Filters\EndsWithFilter;

class MyDataObject extends DataObject
{
    private static string $general_search_field_filter = EndsWithFilter::class;
}
```

[warning]
You may get unexpected results using some filters if you don't disable splitting the query into terms - for example if you use an [ExactMatchFilter](api:SilverStripe\ORM\Filters\ExactMatchFilter), each term in the query _must_ exactly match the value in at least one field to get a match. If you disable splitting terms, the whole query must exactly match a field value instead.
[/warning]

#### Splitting search queries into individual terms

By default the general search field will split your search query on spaces into individual terms, and search across your searchable field for each term. At least one field must match each term to get a match.

For example: with the search query "farm house" at least one field must have a match for the word "farm", and at least one field must have a match for the word "house". There does _not_ need to be a field which matches the full phrase "farm house".

You can disable this behaviour by setting `DataObject.general_search_split_terms` to false. This would mean that for the example above a `DataObject` would need a field that matches "farm house" to be included in the results. Simply matching "farm" or "house" alone would not be sufficient.

Like the general search field name, you can set this either globally or per class:

**Globally disable splitting terms via yaml config**
```yml
SilverStripe\ORM\DataObject:
  general_search_split_terms: false
```

**Disable splitting terms via yaml _or_ php config**
```php
use SilverStripe\ORM\DataObject;
class MyDataObject extends DataObject
{
    private static bool $general_search_split_terms = false;
}
```

#### Use a specific single field

If you disable the global general search functionality, the general seach field will revert to searching against the _first
field_ in your `searchableFields` list.

As an example, let's look at a definition like this:

```php
private static $searchable_fields = [
    'Name',
    'JobTitle',
];
```

That `Name` comes first in that list is actually quite a good thing. The user will likely want the
single search input to target the `Name` field rather something with a more predictable value,
like `JobTitle`.

By contrast, let's look at this definition:

```php
private static $searchable_fields = [
    'Price',
    'Description',
    'Title',
];
```

It's unlikely that the user will want to search on `Price`. A better candidate would be `Title` or `Description`. Rather than reorder the array, which may be counter-intuitive, you can use the `general_search_field` configuration property.

```php
private static $general_search_field = 'Title';
```

##### Customise the field per `GridField`

You can customise the search field for a specific `GridField` by calling `setSearchField()` on its `GridFieldFilterHeader` component instance.

```php
$myGrid->getConfig()->getComponentByType(GridFieldFilterHeader::class)->setSearchField('Title');
```

This is useful if you have disabled the global general search functionality, if you have [customised the SearchContext](/developer_guides/search/searchcontext), or if you (for whatever reason) want to use a single specific search field for this `GridField`.

### Specify a form field or search filter

Searchable fields will appear in the search interface with a default form field (usually a [TextField](api:SilverStripe\Forms\TextField)) and a 
default search filter assigned (usually a [PartialMatchFilter](api:SilverStripe\ORM\Filters\PartialMatchFilter)). To override these defaults, you can specify
additional information on `$searchable_fields`:

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{
    private static $searchable_fields = [
        'Name' => 'PartialMatchFilter',
        'ProductCode' => NumericField::class
    ];
}
```

If you assign a single string value, you can set it to be either a [FormField](api:SilverStripe\Forms\FormField) or [SearchFilter](api:SilverStripe\ORM\Filters\SearchFilter). To specify
both or to combine this with other configuration, you can assign an array:

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{
   private static $searchable_fields = [
       'Name' => [
          'field' => TextField::class,
          'filter' => 'PartialMatchFilter',
       ],
       'ProductCode' => [
           'title' => 'Product code #',
           'field' => NumericField::class,
           'filter' => 'PartialMatchFilter',
       ],
   ];
}
```

### Searching on relations

To include relations (`$has_one`, `$has_many` and `$many_many`) in your search, you can use a dot-notation.

```php
use SilverStripe\ORM\DataObject;

class Team extends DataObject 
{
    private static $db = [
        'Title' => 'Varchar'
    ];
    
    private static $many_many = [
        'Players' => 'Player'
    ];
    
    private static $searchable_fields = [
        'Title',
        'Players.Name',
    ];
}

class Player extends DataObject 
{
    private static $db = [
        'Name' => 'Varchar',
        'Birthday' => 'Date',
    ];
    
    private static $belongs_many_many = [
        'Teams' => 'Team'
    ];
}

```

### Searching many db fields on a single search field

Use a single search field that matches on multiple database fields with `'match_any'`. This also supports specifying a field and a filter, though it is not necessary to do so.

[alert]
If you don't specify a field, you must use the name of a real database field instead of a custom name so that a default field can be determined.
[/alert]

```php
class Order extends DataObject
{
    private static $db = [
        'Name' => 'Varchar',
    ];

    private static $has_one = [
        'Customer' => Customer::class,
        'ShippingAddress' => Address::class,
    ];

    private static $searchable_fields = [
        'CustomName' => [
            'title' => 'First Name',
            'field' => TextField::class,
            'match_any' => [
                // Searching with the "First Name" field will show Orders matching either Name, Customer.FirstName, or ShippingAddress.FirstName
                'Name',
                'Customer.FirstName',
                'ShippingAddress.FirstName',
            ]
        ]
    ];
}
```

## Summary Fields

Summary fields can be used to show a quick overview of the data for a specific [DataObject](api:SilverStripe\ORM\DataObject) record. The most common use 
is their display as table columns, e.g. in the search results of a [ModelAdmin](api:SilverStripe\Admin\ModelAdmin) CMS interface.

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{
    private static $db = [
        'Name' => 'Text',
        'OtherProperty' => 'Text',
        'ProductCode' => 'Int',
    ]; 
    
    private static $summary_fields = [
        'Name',
        'ProductCode',
    ];
}
```

### Relations in summary fields

To include relations or field manipulations in your summaries, you can use a dot-notation.

```php
use SilverStripe\ORM\DataObject;

class OtherObject extends DataObject 
{    
    private static $db = [
        'Title' => 'Varchar',
    ];
}

class MyDataObject extends DataObject
{
    private static $db = [
        'Name' => 'Text',
        'Description' => 'HTMLText',
    ];
    
    private static $has_one = [
        'OtherObject' => 'OtherObject',
    ];
    
    private static $summary_fields = [
        'Name' => 'Name',
        'Description.Summary' => 'Description (summary)',
        'OtherObject.Title' => 'Other Object Title',
    ];
}

```

### Images in summary fields

Non-textual elements (such as images and their manipulations) can also be used in summaries.

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{   
    private static $db = [
        'Name' => 'Text',
    ];
    
    private static $has_one = [
        'HeroImage' => 'Image',
    ];
    
    private static $summary_fields = [
        'Name' => 'Name',
        'HeroImage.CMSThumbnail' => 'Hero Image',
    ];
}

```

## Field labels

In order to re-label any summary fields, you can use the `$field_labels` static. This will also affect the output of `$object->fieldLabels()` and `$object->fieldLabel()`.

```php
use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{   
    private static $db = [
        'Name' => 'Text',
    ];
    
    private static $has_one = [
        'HeroImage' => 'Image',
    ];
    
    private static $summary_fields = [
        'Name',
        'HeroImage.CMSThumbnail',
    ];
    
    private static $field_labels = [
        'Name' => 'Name',
        'HeroImage.CMSThumbnail' => 'Hero',
    ];
}
```

## Related Documentation

* [SearchFilters](searchfilters)

## API Documentation

* [FormScaffolder](api:SilverStripe\Forms\FormScaffolder)
* [DataObject](api:SilverStripe\ORM\DataObject)
