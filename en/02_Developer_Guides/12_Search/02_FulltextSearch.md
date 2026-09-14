---
title: Fulltext Search
summary: Fulltext search allows sophisticated searching on text content.
icon: search
---

# FulltextSearchable

Fulltext search allows advanced search criteria for searching words within a text based data column. While basic
Fulltext search can be achieved using the built-in [MySQLDatabase](api:SilverStripe\ORM\Connect\MySQLDatabase) class a more powerful wrapper for Fulltext
search is provided through a module.

The [FulltextSearchable](api:SilverStripe\ORM\Search\FulltextSearchable) extension will add the correct `Fulltext` indexes to the data model.

> [!CAUTION]
> The [SearchForm](api:SilverStripe\CMS\Search\SearchForm) and [FulltextSearchable](api:SilverStripe\ORM\Search\FulltextSearchable) API's are currently hard coded to be specific to `Page` and `File`
> records and cannot easily be adapted to include custom `DataObject` instances. To include your custom objects in the
> default site search, have a look at those extensions and modify as required.

## Fulltext filter

Silverstripe CMS provides a [FulltextFilter](api:SilverStripe\ORM\Filters\FulltextFilter) which you can use to perform custom fulltext searches on
[DataList](api:SilverStripe\ORM\DataList)s.

Example DataObject:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class SearchableDataObject extends DataObject
{
    private static $db = [
        'Title' => 'Varchar(255)',
        'Content' => 'HTMLText',
    ];

    private static $indexes = [
        'SearchFields' => [
            'type' => 'fulltext',
            'columns' => ['Title', 'Content'],
        ],
    ];
}
```

Performing the search:

```php
use App\Model\SearchableDataObject;

SearchableDataObject::get()->filter('SearchFields:Fulltext', 'search term');
```

If your search index is a single field size, then you may also specify the search filter by the name of the
field instead of the index.

## API documentation

- [FulltextSearchable](api:SilverStripe\ORM\Search\FulltextSearchable)
