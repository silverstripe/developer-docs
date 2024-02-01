---
title: How to Create a Paginated List
summary: Break up the result of a database query into multiple pages
---

# How to create a paginated list

In order to create a paginated list, create a method on your controller that first creates a [`SS_List`](api:SilverStripe\ORM\SS_List) that contains
all your records (e.g. [via the ORM](/developer_guides/model/data_model_and_orm/#querying-data)), then wraps it in a [`PaginatedList`](api:SilverStripe\ORM\PaginatedList) object. The `PaginatedList` constructor should also be passed the
[`HTTPRequest`](api:SilverStripe\Control\HTTPRequest) object so it can read the current page information from the `?start=` GET var.

The `PaginatedList` will automatically set up query limits and read the request for information.

```php
// app/src/PageType/MyPageController.php
namespace App\PageType;

use Page;
use PageController;
use SilverStripe\ORM\PaginatedList;

class MyPageController extends PageController
{
    // ...

    /**
     * Returns a paginated list of all pages in the site.
     */
    public function getPaginatedPages()
    {
        $list = Page::get();

        return PaginatedList::create($list, $this->getRequest());
    }
}
```

> [!WARNING]
> Note that the concept of "pages" used in pagination does not necessarily mean that we're dealing with `Page` classes,
> it's just a term to describe a sub-collection of the list.

There are two ways to generate pagination controls: [PaginatedList::Pages()](api:SilverStripe\ORM\PaginatedList::Pages()) and
[PaginatedList::PaginationSummary()](api:SilverStripe\ORM\PaginatedList::PaginationSummary()). In this example we will use `PaginationSummary()`.

The first step is to simply list the objects in the template:

```ss
<%-- app/templates/App/PageType/Layout/MyPage.ss --%>
<ul>
    <% loop $PaginatedPages %>
        <li><a href="$Link">$Title</a></li>
    <% end_loop %>
</ul>
```

By default this will display 10 pages at a time. The next step is to add pagination controls below this so the user can
switch between pages:

```ss
<%-- app/templates/App/PageType/Layout/MyPage.ss --%>
<% if $PaginatedPages.MoreThanOnePage %>
    <% if $PaginatedPages.NotFirstPage %>
        <a class="prev" href="$PaginatedPages.PrevLink">Prev</a>
    <% end_if %>
    <% loop $PaginatedPages.PaginationSummary %>
        <% if $CurrentBool %>
            $PageNum
        <% else %>
            <% if $Link %>
                <a href="$Link">$PageNum</a>
            <% else %>
                ...
            <% end_if %>
        <% end_if %>
    <% end_loop %>
    <% if $PaginatedPages.NotLastPage %>
        <a class="next" href="$PaginatedPages.NextLink">Next</a>
    <% end_if %>
<% end_if %>
```

If there is more than one page, this block will render a set of pagination controls in the form
`[1] ... [3] [4] [5] [6] [7] ... [10]`.

## Paginating custom lists

In some situations where you are generating the list yourself, the underlying list will already contain only the items
that you wish to display on the current page. In this situation the automatic limiting done by [PaginatedList](api:SilverStripe\ORM\PaginatedList)
will break the pagination. You can disable automatic limiting using the [PaginatedList::setLimitItems()](api:SilverStripe\ORM\PaginatedList::setLimitItems()) method
when using custom lists.

```php
use SilverStripe\ORM\PaginatedList;

$myPreLimitedList = Page::get()->limit(10, $somePageOffset);

$pages = new PaginatedList($myPreLimitedList, $this->getRequest());
$pages->setLimitItems(false);
```

## Setting the number of items per page

By default, the `PaginatedList` includes 10 items per page. You can change this by calling [`setPageLength()`](api:SilverStripe\ORM\PaginatedList::setPageLength()).

```php
$pages = new PaginatedList(Page::get(), $this->getRequest());
$pages->setPageLength(25);
```

If you set this limit to 0 it will disable paging entirely, effectively causing it to appear as a single page
list.

## Template variables {#variables}

Note that this is not an exhaustive list, as any public method on `PaginatedList` can be called from the template.

| Variable | Description |
| -------- | -------- |
| `$MoreThanOnePage` | Returns true when we have a multi-page list, restricted with a limit. |
| `$NextLink`, `$PrevLink` | Link to the next and previous page of items respectively. They will return blank if there's no appropriate page to go to, so `$PrevLink` will return blank when you're on the first page. |
| `$FirstLink`, `$LastLink` | Link to the fist and last page of items respectively. |
| `$CurrentPage` | Current page iterated on. |
| `$TotalPages` | The actual (limited) list of records, use in an inner loop |
| `$FirstItem` | Returns the number of the first item being displayed on the current page. This is useful for things like “displaying 10-20”. |
| `$LastItem` | Returns the number of the last item being displayed on this page. |
| `$TotalItems` | This returns the total number of items across all pages. |
| `$Pages` | Total number of pages. |
| `$PageNum` | Page number, starting at 1 (within `$Pages`) |
| `$Link` | Links to the current controller URL, setting this page as current via a GET parameter |
| `$FirstPage` | Returns true if you're currently on the first page |
| `$LastPage` | Returns true if you're currently on the last page |
| `$CurrentBool` | Returns true if you're currently on that page |

## Related lessons

## API documentation

- [`PaginatedList`](api:SilverStripe\ORM\PaginatedList)
