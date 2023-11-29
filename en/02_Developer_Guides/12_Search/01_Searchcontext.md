---
title: Scaffolding with SearchContext
summary: Configure the search form within ModelAdmin using the SearchContext class.
icon: search
---

# SearchContext

[SearchContext](api:SilverStripe\ORM\Search\SearchContext) manages searching of properties on one or more [DataObject](api:SilverStripe\ORM\DataObject) types, based on a given set of
input parameters. [SearchContext](api:SilverStripe\ORM\Search\SearchContext) is intentionally decoupled from any controller-logic, it just receives a set of
search parameters and an object class it acts on.

The default output of a [SearchContext](api:SilverStripe\ORM\Search\SearchContext) is either a [SQLSelect](api:SilverStripe\ORM\Queries\SQLSelect) object for further refinement, or a
[DataObject](api:SilverStripe\ORM\DataObject) instance.

[notice]
[SearchContext](api:SilverStripe\ORM\Search\SearchContext) is mainly used by [ModelAdmin](/developer_guides/customising_the_admin_interface/modeladmin), as it powers the [`DataObject::$searchable_fields` configuration](/developer_guides/model/scaffolding#searchable-fields).
[/notice]

## Usage

Defining search-able fields on your DataObject.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class MyDataObject extends DataObject
{
    private static $searchable_fields = [
        'Name',
        'ProductCode',
    ];
}
```

## Customizing fields and filters

In this example we're defining three attributes on our MyDataObject subclass: `PublicProperty`, `HiddenProperty`
and `MyDate`. The attribute `HiddenProperty` should not be searchable, and `MyDate` should only search for dates
*after* the search entry (with a `GreaterThanFilter`).

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\Filters\GreaterThanFilter;
use SilverStripe\ORM\Filters\PartialMatchFilter;
use SilverStripe\ORM\Search\SearchContext;

class MyDataObject extends DataObject
{
    private static $db = [
        'PublicProperty' => 'Text'
        'HiddenProperty' => 'Text',
        'MyDate' => 'Date',
    ];

    public function getDefaultSearchContext()
    {
        $fields = $this->scaffoldSearchFields([
            'restrictFields' => ['PublicProperty','MyDate'],
        ]);

        $filters = [
            'PublicProperty' => PartialMatchFilter::create('PublicProperty'),
            'MyDate' => GreaterThanFilter::create('MyDate'),
        ];

        return SearchContext::create(
            static::class,
            $fields,
            $filters
        );
    }
}
```

[notice]
See the [SearchFilter](../model/searchfilters) documentation for more information about filters to use such as the
`GreaterThanFilter`.
[/notice]

[notice]
In case you need multiple contexts, consider name-spacing your request parameters by using `FieldList->namespace()` on
the `$fields` constructor parameter.
[/notice]

### Customising the general search field

On tabular views like the GridFields and ModalAdmins, the search context is rendered as a search bar
with advanced options. To customise this field, see the [Scaffolding documentation](../model/scaffolding#general-search-field).

### Generating a search form from the context

```php
namespace App\PageType;

use App\Model\MyDataObject;
use PageController;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormAction;

class SearchPageController extends PageController
{
    // ...

    public function searchForm()
    {
        $context = MyDataObject::singleton()->getDefaultSearchContext();
        $fields = $context->getSearchFields();

        $form = Form::create(
            $this,
            'searchForm',
            $fields,
            FieldList::create(
                FormAction::create('doSearch')
            )
        );

        return $form;
    }

    public function doSearch($data, $form)
    {
        $context = MyDataObject::singleton()->getDefaultSearchContext();
        $results = $context->getResults($data);

        return $this->customise([
            'Results' => $results,
        ])->renderWith('Page_results');
    }
}
```

### Pagination

For pagination records on multiple pages, you need to wrap the results in a
`PaginatedList` object. This object is also passed the generated `SQLSelect`
in order to read page limit information. It is also passed the current
`HTTPRequest` object so it can read the current page from a GET var.

Notice that if you want to use this getResults function, you need to change the function doSearch for this one.

The change is in **$results = $this->getResults($data);**, because you are using a custom getResults function.

```php
namespace App\PageType;

use App\Model\MyDataObject;
use PageController;
use SilverStripe\ORM\PaginatedList;
// ...

class SearchPageController extends PageController
{
    // ...

    public function doSearch($data, $form)
    {
        $context = MyDataObject::singleton()->getDefaultSearchContext();
        $results = $this->getResults($data);

        return $this->customise([
            'Results' => $results,
        ])->renderWith('Page_results');
    }

    public function getResults($searchCriteria = [])
    {
        $start = ($this->getRequest()->getVar('start')) ? (int)$this->getRequest()->getVar('start') : 0;
        $limit = 10;

        $context = MyDataObject::singleton()->getDefaultSearchContext();
        $query = $context->getQuery($searchCriteria, null, ['start' => $start,'limit' => $limit]);
        $records = $context->getResults($searchCriteria, null, ['start' => $start,'limit' => $limit]);

        if ($records) {
            $records = PaginatedList::create($records, $this->getRequest());
            $records->setPageStart($start);
            $records->setPageLength($limit);
            $records->setTotalItems($query->unlimitedRowCount());
        }

        return $records;
    }
}
```

Another thing you can't forget is to check the name of the singleton you are using in your project. the example uses
**MyDataObject**, you need to change it for the one you are using

### The pagination template

to show the results of your custom search you need at least this content in your template, notice that
Results.PaginationSummary(4) defines how many pages the search will show in the search results. something like:

**Next   1 2  *3*  4  5 &hellip; 558**  

```ss
<% if $Results %>
    <ul>
        <% loop $Results %>
            <li>$Title, $Author</li>
        <% end_loop %>
    </ul>
<% else %>
    <p>Sorry, your search query did not return any results.</p>
<% end_if %>

<% if $Results.MoreThanOnePage %>
    <div id="PageNumbers">
        <p>
            <% if $Results.NotFirstPage %>
                <a class="prev" href="$Results.PrevLink" title="View the previous page">Prev</a>
            <% end_if %>
        
            <span>
                    <% loop $Results.PaginationSummary(4) %>
                    <% if $CurrentBool %>
                        $PageNum
                    <% else %>
                        <% if $Link %>
                            <a href="$Link" title="View page number $PageNum">$PageNum</a>
                        <% else %>
                            &hellip;
                        <% end_if %>
                    <% end_if %>
                <% end_loop %>
            </span>
        
            <% if $Results.NotLastPage %>
                <a class="next" href="$Results.NextLink" title="View the next page">Next</a>
            <% end_if %>
        </p>
    </div>
<% end_if %>
```

## Available searchFilters

See [SearchFilter](api:SilverStripe\ORM\Filters\SearchFilter) API Documentation

## Related documentation

- [ModelAdmin](/developer_guides/customising_the_admin_interface/modeladmin)

## API documentation

- [SearchContext](api:SilverStripe\ORM\Search\SearchContext)
- [DataObject](api:SilverStripe\ORM\DataObject)
