---
title: Managing Lists
summary: The SS_List interface allows you to iterate through and manipulate a list of objects.
icon: list
---

# Managing Lists

Whenever using the ORM to fetch records or navigate relationships you will receive an [SS_List](api:SilverStripe\ORM\SS_List) instance commonly as
either [DataList](api:SilverStripe\ORM\DataList) or [RelationList](api:SilverStripe\ORM\RelationList). This object gives you the ability to iterate over each of the results or
modify.

There's a lot more information about filtering and sorting lists in the [Introduction to the Data Model and ORM](/developer_guides/model/data_model_and_orm/) section.

## Iterating over the list

[`SS_List`](api:SilverStripe\ORM\SS_List) extends the [`IteratorAggregate`](https://www.php.net/manual/en/class.iteratoraggregate.php) interface, allowing you to loop over the instance.

```php
use SilverStripe\Security\Member;

$members = Member::get();

foreach($members as $member) {
    echo $member->Name;
}
```

Or in the template engine:

```ss
<%-- Assuming there is a "getMembers()" method or a "Members" relation --%>
<% loop $Members %>
    $Name
<% end_loop %>
```

## Finding an item by value

You can use the [`find()`](api:SilverStripe\ORM\SS_List::find()) method to get a single item based on the value of one of its properties.

```php
$members = Member::get();

// returns a string e.g. 'Sam'
echo $members->find('ID', 4)->FirstName;
```

## Maps

A map is like an array, where the indexes contain data as well as the values. You can build a map from any list by calling the [`map()](api:SilverStripe\ORM\SS_List::map()) method.

```php
$members = Member::get()->map('ID', 'FirstName');

foreach ($members as $id => $firstName) {
    // Do something here with that data
}
```

This functionality is provided by the [`Map`](api:SilverStripe\ORM\Map) class, which can be used to build a map from any `SS_List`. You can instantiate a new `Map` object using the `new` keyword as well.

```php
$membersMap = new Map(Member::get(), 'ID', 'FirstName');
```

## Column

You can get all of the values for a single property by calling the [`column()`](api:SilverStripe\ORM\SS_List::column()) method.

```php
// returns [
//    'sam@example.com',
//    'sig@example.com',
//    'will@example.com'
// ];
$emailAddresses = Member::get()->column('Email');
```

## Iterating over a large list {#chunkedFetch}

When iterating over a `DataList`, the ORM will create a [`Generator`](https://www.php.net/manual/en/language.generators.overview.php). This means we don't have all of the `DataObject` records in the list instantiated in memory, but the ORM _does_ fetch all of the data about those records and loads that data in memory. This can consume a lot of memory when working with a large data set.

To limit the amount of data loaded in memory, you can use the [`chunkedFetch()`](api:SilverStripe\ORM\DataList::chunkedFetch()) method on your `DataList`. In most cases, you can iterate over the results of `chunkedFetch()` the same way you would iterate over your `DataList`. Internally, `chunkedFetch()` will split the database query into smaller queries and keep running through them until it runs out of results.

```php
// Without using chunked fetch, all of the data for all of the Member records will be fetched from the database in a single query
$members = Member::get();
foreach ($members as $member) {
    echo $member->Email;
}

// This call will produce the same output, but it will use less memory and run more queries against the database
$members = Member::get()->chunkedFetch();
foreach ($members as $member) {
    echo $member->Email;
}
```

`chunkedFetch()` will respect any filter or sort condition applied to the `DataList`.

By default, chunk will limit each query to 1000 results. You can explicitly set this limit by passing an integer to `chunkedFetch()`.

```php
// Each query will only return 10 results at a time
$members = Member::get()
    ->filter('Email:PartialMatch', 'silverstripe.com')
    ->sort('Email')
    ->chunkedFetch(10);
foreach ($members as $member) {
    echo $member->Email;
}
```

There are some limitations:
* `chunkedFetch()` will ignore any limit or offset you have applied to your `DataList`
* you cannot "count" a chunked list or do any other call against it aside from iterating it
* while iterating over a chunked list, you cannot perform any operation that would alter the order of the items.

## ArrayList

[`ArrayList`](api:SilverStripe\ORM\ArrayList) exists to wrap a standard PHP array in the same API as a database backed list.

```php
$sam = Member::get()->byId(5);
$sig = Member::get()->byId(6);

$list = new ArrayList();
$list->push($sam);
$list->push($sig);

// returns '2'
$numItems = $list->Count();
```

## Related Lessons
* [Lists and pagination](https://www.silverstripe.org/learn/lessons/v4/lists-and-pagination-1)

## API Documentation

* [SS_List](api:SilverStripe\ORM\SS_List)
* [RelationList](api:SilverStripe\ORM\RelationList)
* [DataList](api:SilverStripe\ORM\DataList)
* [ArrayList](api:SilverStripe\ORM\ArrayList)
* [Map](api:SilverStripe\ORM\Map)
