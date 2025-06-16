---
title: Eager loading
summary: Avoid the N + 1 queries with eager loading
---

# Eager loading

Querying nested relationships inside a loop using the ORM is prone to the N + 1 query problem. To illustrate the N + 1 query problem, imagine a scenario where there are Teams with many child Players

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $has_many = [
        'Players' => Player::class,
    ];
}
```

To retrieve teams and their players:

```php
$teams = Team::get();

foreach ($teams as $team) {
    foreach ($team->Players() as $player) {
        echo $player->FirstName;
    }
}
```

In this case the loop will execute one query to retrieve all the teams and then an additional query for each team to retrieve its players. If we have 20 teams this loop would run 21 queries - one to get all the teams and then 20 more queries to get the players for each team.

```sql
# Retrieve all the teams
# Note this is not the exact SQL that would generated it is just for demonstration
SELECT * FROM Team;

# Retrieve the players for all the teams in 20 separate queries:
SELECT * FROM Player WHERE TeamID = 1
SELECT * FROM Player WHERE TeamID = 2
SELECT * FROM Player WHERE TeamID = 3
SELECT * FROM Player WHERE TeamID = ...
```

The N + 1 query problem can be alleviated using eager loading which in this example will reduce this down to just two queries. We do this by passing the relationships that should be eagerly loaded to the [`DataList::eagerLoad()`](api:SilverStripe\ORM\DataList::eagerLoad()) method:

```php
$teams = Team::get()->eagerLoad('Players');
```

> [!CAUTION]
> Manipulating the eager loading query is significantly (up to ~600%) faster than Filtering an `EagerLoadedlist` after the query has been made.
>
> See [manipulating eagerloading queries](#manipulating-eager-loading-queries).

With eager loading now only two queries will be executed:

```sql
# Retrieve all the teams
SELECT * FROM Team

# Retrieve all the players for the teams in a single query:
SELECT * FROM Player WHERE TeamID IN (1, 2, 3, ...)
```

Suppose we have the following related classes:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $has_many = [
        'Players' => Player::class,
        'Fans' => Fan::class,
    ];
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $has_one = [
        'Team' => Team::class,
    ];

    private static $many_many = [
        'Games' => Game::class,
    ];
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Game extends DataObject
{
    private static $has_many = [
        'Officials' => Official::class,
        'Sponsors' => Sponsor::class,
    ];
}
```

In this example, to eager load the Players and Fans relationships on Team, pass multiple arguments to the `eagerLoad()` method:

```php
$teams = Team::get()->eagerLoad('Players', 'Fans');
```

Perhaps, you may need to get all the `Officials` that are related to each `Game`. In this example, you can use another feature provided by the `eagerLoad` method. Eager load nested relationships up to **three** levels deep using the dot syntax:

```php
$teams = Team::get()->eagerLoad('Players.Games.Officials');
```

You can then access the nested relationships in the loop as you normally would:

```php
foreach ($teams as $team) {
    foreach ($team->Players() as $player) {
        foreach ($player->Games() as $game) {
            foreach ($game->Officials() as $official) {
                // Everything will have been eager loaded at this point
                echo $official->FirstName;
            }
        }
    }
}
```

You can get the results for multiple nested relations with multiple arguments:

```php
$teams = Team::get()->eagerLoad(
    'Players.Games.Officials',
    'Players.Games.Sponsors'
);
```

Eager loading can be used in templates. The following example assumes that `$MyTeams` is an available `DataList` which could be provided via a `getMyTeams()` method on `PageController`:

```ss
<% loop $MyTeams.eagerLoad('Players') %>
    <% loop $Players %>
        <p>Player first name is $FirstName</p>
    <% end_loop %>
<% end_loop %>
```

Eager loading supports all relationship types.

> [!WARNING]
> Eager loading is only intended to be used in read-only scenarios such as when outputting data on the front-end of a website. When using default lazy-loading, relationship methods will return a subclass of [`DataList`](api:SilverStripe\ORM\DataList) such as [`HasManyList`](api:SilverStripe\ORM\HasManyList). However when using eager-loading, an [`EagerLoadedList`](api:SilverStripe\ORM\EagerLoadedList) will be returned instead. `EagerLoadedList` has common methods such as `filter()`, `sort()`, `limit()` and `reverse()` available to manipulate its data, as well as some methods you'd expect on the various relation list implementations such as [`getExtraData()`](api:SilverStripe\ORM\EagerLoadedList::getExtraData()).

## Manipulating eager loading queries

There are some limitations to manipulating an `EagerLoadedList` (i.e. after the query has been executed).

The main limitation is that filtering or sorting an `EagerLoadedList` will be done in PHP rather than as part of the database query, since we have already loaded all its relevant data into memory.

> [!WARNING]
> `EagerLoadedList` can't filter or sort by fields on relations using dot notation (e.g. `sort('MySubRelation.Title')` won't work).
>
> Manipulating the eager loading query is significantly (up to ~600%) faster than Filtering an `EagerLoadedlist` after the query has been made.

You can avoid those problems by applying manipulations such as filtering and sorting to the eager loading query as part of your call to `eagerLoad()`.

You can pass an associative array into the `eagerLoad()` method, with relation chains as the keys and callbacks as the values. The callback accepts a `DataList` argument, and must return a `DataList`.

> [!CAUTION]
> You can't manipulate the lists of `has_one` or `belongs_to` relations. This functionality is intended primarily as a way to pre-filter or pre-sort `has_many` and `many_many` relations.

```php
use SilverStripe\ORM\DataList;

$teams = Team::get()->eagerLoad([
    'Players' => fn (DataList $list) => $list->filter(['Age:GreaterThan' => 18]),
]);
```

The list passed into your callback represents the query for that relation on *all* of the records you're fetching. For example, the `$list` variable above is a `DataList` that will fetch all `Player` records in the `Players` relation for all `Team` records (so long as they match the filter applied in the callback).

Note that each relation in the relation chain (e.g. `Players`, `Players.Fans`, `Players.Fans.Events`) can have their own callback:

```php
use SilverStripe\ORM\DataList;

$teams = Team::get()->eagerLoad([
    'Players' => fn (DataList $list) => $list->filter(['Age:GreaterThan' => 18]),
    'Players.Fans' => fn (DataList $list) => $list->filter(['Name:PartialMatch:nocase' => 'Sam']),
    'Players.Fans.Events' => fn (DataList $list) => $list->filter(['DollarCost:LessThan' => 200]),
]);
```

If you have complex branching logic, and in some branches you want to avoid pre-filtering or perform different filtering, you can declare a different callback (or `null`) for that relation chain by calling `eagerLoad()` again. Note that subsequent callbacks *replace* previous callbacks.

```php
use SilverStripe\ORM\DataList;

$teams = Team::get()->eagerLoad([
    // Remove any callback that was previously defined for this relation chain
    'Players' => fn (DataList $list) => null,
    // Replace any callback that was previously defined for this relation chain.
    // If you want to apply *additional* filters rather than replacing existing ones, you will
    // need to declare the original filter again here.
    'Players.Fans.Events' => fn (DataList $list) => $list->filter(['DollarCost:GreaterThan' => 100]),
]);
```
