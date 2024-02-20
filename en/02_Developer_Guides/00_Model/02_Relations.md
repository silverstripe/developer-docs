---
title: Relations between Records
summary: Relate models together using the ORM using has_one, has_many, and many_many.
icon: link
---

# Relations between records

In most situations you will likely see more than one [`DataObject`](api:SilverStripe\ORM\DataObject) and several classes in your data model may relate
to one another. An example of this is a `Player` object may have a relationship to one or more `Team` or `Coach` classes
and could take part in many `Games`. Relations are a key part of designing and building a good data model.

Relations are built through static array definitions on a class, in the format `<relationship-name> => <classname>`.
Silverstripe CMS supports a number of relationship types and each relationship type can have any number of relations.

## `has_one`

Many-to-one and one-to-one relationships create a database-column called `<relationship-name>ID`, in the example below this would be `TeamID` on the `Player` table.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $has_one = [
        'Team' => Team::class,
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $db = [
        'Title' => 'Varchar',
    ];

    private static $has_many = [
        'Players' => Player::class,
    ];
    // ...
}
```

This defines a one-to-many relationship called `Team` which links any number of `Player` records to a single `Team` record. The ORM handles navigating the relationship
and provides a short syntax for accessing the related object.

> [!TIP]
> Relations don't only apply to your own `DataObject` models - you can make relations to core models such as `File` and `Image` as well:
>
> ```php
> namespace App\Model;
>
> use SilverStripe\Assets\File;
> use SilverStripe\Assets\Image;
> use SilverStripe\ORM\DataObject;
>
> class Team extends DataObject
> {
>     private static $has_one = [
>         'Teamphoto' => Image::class,
>         'Lineup' => File::class,
>     ];
>     // ...
> }
> ```

At the database level, the `has_one` from our example above creates a `TeamID` field on the `Player` table. A `has_many` field does not impose any database changes. It merely injects a new method into the class to access the related records (in this case, `Players()`)

```php
$player = Player::get()->byId(1);

$team = $player->Team();
// returns a 'Team' instance.

echo $player->Team()->Title;
// returns the 'Title' column on the 'Team' or `getTitle` if it exists.
```

> [!NOTE]
> Even if the `$player` record doesn't have any team record saved in its `Team` relation, `$player->Team()` will return a `Team` object. In that case, it will be an *empty* record, with only default values applied. You can validate if that is the case by calling [`exists()`](api:SilverStripe\ORM\DataObject::exists()) on the record (e.g. `$player->Team()->exists()`).

The relationship can also be navigated in [templates](../templates).

```ss
<% with $Player %>
    <% if $Team.exists %>
        Plays for $Team.Title
    <% end_if %>
<% end_with %>
```

### Polymorphic `has_one` {#polymorphic-has-one}

A `has_one` relation can also be polymorphic, which allows any type of object to be associated.
This is useful where there could be many use cases for a particular data structure.

An additional column is created called `<relationship-name>Class`, which along
with the `<relationship-name>ID` column identifies the object.

To specify that a `has_one` relation is polymorphic set the type to [`DataObject`](api:SilverStripe\ORM\DataObject).
Ideally, the associated `has_many` (or `belongs_to`) should be specified with ["dot notation"](#dot-notation).

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $has_many = [
        'Fans' => Fan::class . '.FanOf',
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $has_many = [
        'Fans' => Fan::class . '.FanOf',
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Fan extends DataObject
{
    // Generates columns FanOfID and FanOfClass
    // The actual class of objects returned by $fan->FanOf() will vary
    private static $has_one = [
        'FanOf' => DataObject::class,
    ];
    // ...
}
```

> [!WARNING]
> Note: The use of polymorphic relationships can affect query performance, especially
> on joins, and also increases the complexity of the database and necessary user code.
> They should be used sparingly, and only where additional complexity would otherwise
> be necessary. For example additional parent classes for each respective relationship, or
> duplication of code.

### Multi-relational `has_one` {#multi-relational-has-one}

A single `has_one` relation can be allowed to manage multiple `has_many` relations - this is especially useful
in situations like adding multiple lists of links to a [`SiteConfig`](api:SilverStripe\SiteConfig\SiteConfig) to build a menu.

An additional column is created called `<relationship-name>Relation`, along with the `<relationship-name>Class`
and `<relationship-name>ID` columns of a normal polymorphic `has_one` relation.

> [!WARNING]
> If you save records into the `has_one` relation programatically, you must set the relation in the
> `<relationship-name>Relation` field, or it won't be included when you fetch the `has_many` relation list.
>
> Generally it is better to instead add the record with the `has_one` relation into its corresponding `has_many` relation
> directly - see [adding relations](#adding-relations).

To specify that a `has_one` relation is multi-relational define the relation like so:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\DataObjectSchema;

class Fan extends DataObject
{
    // ...

    private static array $has_one = [
        'FanOf' => [
            // The class here is the class for the has_one - it must be polymorphic.
            'class' => DataObject::class,
            // Setting this to true is what defines this has_one relation as multi-relational
            DataObjectSchema::HAS_ONE_MULTI_RELATIONAL => true,
        ],
    ];
}
```

> [!TIP]
> Multi-relational `has_one` relations *must* be [polymorphic](#polymorphic-has-one).

It is best practice for your `has_many` relations to indicate which relation they're pointing at using dot notation. For example:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    // ...

    private static array $has_many = [
        // Notice that these are both pointing at the same has_one relation!
        'CheapFans' => Fan::class . '.FanOf',
        'VipFans' => Fan::class . '.FanOf',
    ];
}
```

See [`has_many`](#has_many) below for more details about `has_many` relations.

### `belongs_to`

Defines a one-to-one relationship with another object, which declares the other end of the relationship with a
corresponding `has_one`. A single database column named `<relationship-name>ID` will be created in the object with the
`has_one`, but the `belongs_to` by itself will not create a database field.

Similarly with `has_many` below, [dot notation](#dot-notation) can (and for best practice *should*) be used to explicitly specify the `has_one` which refers to this relation.
This is not mandatory unless the relationship would be otherwise ambiguous.

> [!TIP]
> You can use `RelationValidationService` for validation of relationships. This tool will point out the relationships which may need a review. See [Validating relations](#validating-relations) for more information.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $has_one = [
        'Coach' => Coach::class,
    ];
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Coach extends DataObject
{
    private static $belongs_to = [
        'Team' => Team::class . '.Coach',
    ];
}
```

## `has_many`

Defines one-to-many joins. As you can see from the previous example, `$has_many` goes hand in hand with `$has_one`.

> [!CAUTION]
> When defining a `has_many` relation, you *must* specify a `has_one` relationship on the related class as well. To add a `has_one` relation on core classes, yml config settings can be used:
>
> ```yml
> SilverStripe\Assets\Image:
>   has_one:
>     Team: App\Model\Team
> ```
>
> You can point multiple `has_many` relations at a single `has_one` relation if you use a [multi-relational `has_one`](#multi-relational-has-one).
>
> Note that in some cases you may be better off using a `many_many` relation instead. Carefully consider whether you are defining a "one-to-many" or a "many-to-many" relationship.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $db = [
        'Title' => 'Varchar',
    ];

    private static $has_many = [
        'Players' => Player::class,
    ];
    // ...
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
    // ...
}
```

Much like the `has_one` relationship, `has_many` can be navigated through the ORM as well. The only difference being
you will get an instance of [`HasManyList`](api:SilverStripe\ORM\HasManyList) rather than the object.

```php
$team = Team::get()->first();

/** @var HasManyList $players */
$players = $team->Players();

/** @var int $numPlayers */
$numPlayers = $players->Count();

foreach ($players as $player) {
    echo $player->FirstName;
}
```

If you're using the default scaffolded form fields with multiple `has_one` relationships, you will end up with a CMS field for each relation. If you don't want these you can remove them, referring to them with as `<relation-name>ID`:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Company extends DataObject
{
    // ...

    public function getCMSFields()
    {
        $fields = parent::getCMSFields();
        $fields->removeByName(['ManagerID', 'CleanerID']);
        return $fields;
    }
}
```

## Dot notation {#dot-notation}

To specify multiple `has_many`, `many_many`, `belongs_to`, or `belongs_many_many` relationships to the same model class (and as a general best practice) you can use dot notation to distinguish them like below:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Person extends DataObject
{
    private static $has_many = [
        'Managing' => Company::class . '.Manager',
        'Cleaning' => Company::class . '.Cleaner',
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Company extends DataObject
{
    private static $has_one = [
        'Manager' => Person::class,
        'Cleaner' => Person::class,
    ];
    // ...
}
```

Multiple `has_many` or `belongs_to` relationships are okay *without* dot notation if they aren't linking to the same model class. Otherwise, using dot notation is required. With that said, dot notation is recommended in all cases as it makes your code more resilient to change. Adding new relationships is easier when you don't need to review and update existing ones.

> [!TIP]
> You can use `RelationValidationService` for validation of relationships. This tool will point out the relationships which may need a review. See [Validating relations](#validating-relations) for more information.

## `many_many` relationships {#many-many}

> [!WARNING]
> Please specify a `belongs_many_many` relationship on the related class as well in order to have the necessary accessors available on both ends. See [`belongs_many_many`](#belongs-many-many) for more information.

Defines many-to-many relationships. This type of relationship requires a new table which has an `ID` column to represent the relationship itself and a column for each of the IDs of the related records.

There are two ways this relationship can be declared which are (described below) depending on how the developer wishes to manage this join table.

> [!TIP]
> You can use `RelationValidationService` for validation of relationships. This tool will point out the relationships which may need a review. See [Validating relations](#validating-relations) for more information.

### Automatic `many_many` table {#automatic-many-many-table}

If you specify only a single class as the other side of the many-many relationship, then a
table will be automatically created between the two. It will be the table name of the class which declares the `many_many` relationship, suffixed with the relationship name (e.g. `Team_Supporters`).
The table will be created with an `ID` column to represent the relationship itself and a column for each of the IDs of the related records

Extra fields on the mapping table can be created by declaring a `many_many_extraFields`
config to add extra columns.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $many_many = [
        'Supporters' => Supporter::class,
    ];

    private static $many_many_extraFields = [
        'Supporters' => [
          'Ranking' => 'Int',
        ],
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Supporter extends DataObject
{
    private static $belongs_many_many = [
        'Supports' => Team::class,
    ];
    // ...
}
```

To ensure this `many_many` is sorted by "Ranking" by default you can add this to your config:

```yml
Team_Supporters:
  default_sort: 'Ranking ASC'
```

`Team_Supporters` is the table name automatically generated for the `many_many` relation in this case.

### `many_many` through relationship joined on a separate `DataObject` {#many-many-through}

If necessary, a third `DataObject` class can instead be specified as the joining table,
rather than having the ORM generate an automatically scaffolded table. This has the following
advantages:

- Allows versioning of the mapping table, including support for the
ownership API (see [Versioning](/developer_guides/model/versioning) for more information).
- Allows support of other extensions on the mapping table (e.g. for [subsites](https://github.com/silverstripe/silverstripe-subsites) or localisation via [fluent](https://github.com/tractorcow-farm/silverstripe-fluent)).
- Extra fields can easily be managed separately via the joined dataobject, even via a separate `GridField` or form.

This is declared via array syntax, with the following keys on the `many_many` relation:

- `through`: Class name of the mapping table
- `from`: Name of the `has_one` relationship pointing back at the object declaring `many_many`
- `to`: Name of the `has_one` relationship pointing to the object declaring `belongs_many_many`.

Just like any normal `DataObject`, you can apply a default sort which will be applied when
accessing many many through relations.

Note: The `through` class must not also be the name of any field or relation on the parent
or child record.

The [syntax for `belongs_many_many`](#belongs-many-many) is unchanged.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $many_many = [
        'Supporters' => [
            'through' => TeamSupporter::class,
            'from' => 'Team',
            'to' => 'Supporter',
        ],
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Supporter extends DataObject
{
    // It can be useful, but not necessary, to include the reverse relation name via dot-notation
    // i.e. 'Supports' => Team::class . '.Supporters'
    private static $belongs_many_many = [
        'Supports' => Team::class,
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class TeamSupporter extends DataObject
{
    private static $db = [
        'Ranking' => 'Int',
    ];

    private static $has_one = [
        'Team' => Team::class,
        'Supporter' => Supporter::class,
    ];

    private static $default_sort = 'Ranking ASC';
}
```

You can filter on the relation by the extra fields automatically, assuming they don't conflict with names of fields on other tables in the query.

```php
$team = Team::get()->byId(1);
$supporters = $team->Supporters()->filter(['Ranking' => 1]);
```

> [!TIP]
> For records accessed in a [`ManyManyThroughList`](api:SilverStripe\ORM\ManyManyThroughList), you can access the join record (e.g. for our example above a `TeamSupporter` instance) by calling [`getJoin()`](api:SilverStripe\ORM\DataObject::getJoin()) or as the `$Join` property in templates.

#### Polymorphic `many_many`

Using many_many through it is possible to support polymorphic relations on the mapping table.
Note, that this feature has certain limitations:

- This feature only works with many_many through
- This feature will only allow polymorphic `many_many`, but not `belongs_many_many`.
  - You can have a `has_many` relation to the join table where you would normally use `belongs_many_many`, and iterate through it
to collate parent records - but note that this will trigger a database query for every single record in the relation (because relations are not eager loaded by default), and filtering/etc would require additional complexity.

Note that this works by leveraging a polymorphic `has_one` relation on the join class. See [Polymorphic has_one](#polymorphic-has-one) for more information about that relation type.

For instance, this is how you would link an arbitrary object to `many_many` tags.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class SomeObject extends DataObject
{
    // This same many_many may also exist on other classes
    private static $many_many = [
        'Tags' => [
            'through' => TagMapping::class,
            'from' => 'Parent',
            'to' => 'Tag',
        ],
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Tag extends DataObject
{
    // has_many works, but belongs_many_many will not
    // note that we are explicitly declaring the join class "TagMapping" here instead of the "SomeObject" class.
    private static $has_many = [
        'TagMappings' => TagMapping::class,
    ];

    /**
     * Example iterator placeholder for belongs_many_many.
     * This is a list of arbitrary types of objects
     * @return Generator
     */
    public function getTaggedObjects()
    {
        foreach ($this->TagMappings() as $mapping) {
            yield $mapping->Parent();
        }
    }
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class TagMapping extends DataObject
{
    private static $has_one = [
        // Polymorphic has_one
        'Parent' => DataObject::class,
        'Tag' => Tag::class,
    ];
}
```

### Using `many_many` relationships

Much like `has_one` and `has_many` relationships, `many_many` can be navigated through the ORM as well.
The only difference being you will get an instance of [ManyManyList](api:SilverStripe\ORM\ManyManyList) or
[ManyManyThroughList](api:SilverStripe\ORM\ManyManyThroughList) returned.

```php
$team = Team::get()->byId(1);

/** @var MayManyList|ManyManyThroughList $supporters */
$supporters = $team->Supporters();
```

You can add objects to the relation simply by calling `add()` on the relation list:

```php
$team = Team::get()->byId(1);
$supporter = Supporter::get()->first();
$team->Supporters()->add($supporter);
```

#### Setting many_many extra fields data

You can set the extra fields data at the same time as adding the record to the relationship list:

```php
$team = Team::get()->byId(1);
$supporter = Supporter::get()->first();
$team->Supporters()->add($supporter, ['Ranking' => 1]);
```

You can also declare extra fields data later on. For regular `many_many` relationships [using an automatic `many_many` table](#automatic-many-many-table) you can use the `setExtraData()` method on the list:

```php
$team = Team::get()->byId(1);
$supporter = Supporter::get()->first();
$team->Supporters()->add($supporter);
$team->Supporters()->setExtraData($supporter->ID, ['Ranking' => 2]);
```

For [`many_many` through relationships](#many-many-through), just treat the join record the same as you would any other `DataObject` record.

```php
$team = Team::get()->byId(1);
$supporter = Supporter::get()->first();
$team->Supporters()->add($supporter);

$joinRecord = TeamSupporter::get()->filter(['TeamID' => $team->Id, 'SupporterID' => $supporter->ID])->first();
$joinRecord->Ranking = 2;
$joinRecord->write();
```

#### Using `many_many` in templates

The relationship can also be navigated in [templates](../templates).

```ss
<% with $Supporter %>
    <% loop $Supports %>
        Supports $Title (rank $Ranking)
    <% end_loop %>
<% end_with %>
```

> [!TIP]
> For many_many through relations, the join record can be accessed via [`$Join`](api:SilverStripe\ORM\DataObject::getJoin()) or the actual relation name (e.g. `$TeamSupporter`). This is useful if your template is class-agnostic and doesn't know specifically what relation names are used.
>
> This also provides three ways to access the extra fields on a many_many through relation:
>
> ```ss
> <% with $Supporter %>
>     <% loop $Supports %>
>         Access extrafields directly: $Ranking
>         Access extrafields using getJoin: $Join.Ranking
>         Access extrafields using the somewhat-magic join-class selector: $TeamSupporter.Ranking
>     <% end_loop %>
> <% end_with %>
> ```

## `belongs_many_many` {#belongs-many-many}

The `belongs_many_many` relation represents the other side of the `many_many` relationship.
When using either a basic `many_many` or a `many_many` through, the syntax for `belongs_many_many` is the same.

To specify multiple `many_many` relationships between the same classes, specify use [dot notation](#dot-notation) to
distinguish them like below:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Category extends DataObject
{
    private static $many_many = [
        'Products' => Product::class,
        'FeaturedProducts' => Product::class,
    ];
    // ...
}
```

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Product extends DataObject
{
    private static $belongs_many_many = [
        'Categories' => Category::class . '.Products',
        'FeaturedInCategories' => Category::class . '.FeaturedProducts',
    ];
    // ...
}
```

If you're unsure about whether an object should take on `many_many` or `belongs_many_many`,
the best way to think about it is that the object where the relationship will be edited
(i.e. via checkboxes) should contain the `many_many`. For instance, in a `many_many` of
`Product` => `Category`, the `Product` model should contain the `many_many` side of the relationship, because it is much
more likely that the user will select categories for a product than vice-versa.

## Eager loading

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

### Manipulating eager loading queries

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

## Cascading deletions

Relationships between objects can cause cascading deletions, if necessary, through configuration of the
`cascade_deletes` config on the class that declares the relationship.

> [!CAUTION]
> Declaring `cascade_deletes` implies delete permissions on the listed objects.
> Built-in controllers using delete operations check `canDelete()` on the owner, but not on the owned object.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class ParentObject extends DataObject
{
    private static $has_one = [
        'Child' => ChildObject::class,
    ];

    private static $cascade_deletes = [
        'Child',
    ];
    // ...
}
```

In this example, when the parent object is deleted, the child specified by the `has_one` relation will also
be deleted. Note that all relation types (`has_many`, `many_many`, `belongs_many_many`, `belongs_to`, and `has_one`)
are supported, as are methods that return lists of objects but do not correspond to a physical database relation.

If your object is versioned, `cascade_deletes` will also act as "cascade unpublish", such that any unpublish
on a parent object will trigger unpublish on the child, similarly to how `owns` causes triggered publishing.
See the [versioning docs](/developer_guides/model/versioning) for more information on ownership.

> [!CAUTION]
> If the child model is not versioned, `cascade_deletes` will result in the child record being *deleted* if the parent is unpublished! Be sure to check whether both sides of the relationship are versioned before declaring `cascade_deletes`.

## Cascading duplications

Similar to `cascade_deletes` there is also a `cascade_duplicates` config which works in much the same way.
When you invoke [`duplicate()`](api:SilverStripe\ORM\DataObject::duplicate()) on a `DataObject` record,
relation names specified by this config will be duplicated
and saved against the new clone object.

Note that duplications will act differently depending on the kind of relation:

- Records in one-to-many or many-to-many relationships (e.g. `has_many`, `has_one`, and `belongs_to`) will be explicitly duplicated.
- Records in many-to-many (i.e. `many_many` and `belongs_many_many`) relationships will *not* be duplicated, but the mapping table values will instead
be copied so that the original records are related to the new duplicate record.

For example:

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class ParentObject extends DataObject
{
    private static $many_many = [
        // None of the ManyManyExample records in this relationship will be duplicated.
        // Instead each row in the join table will be copied, connecting the new duplicated ParentObject
        // record with each of the original ManyManyExample records in the original relationship.
        'ManyManyExamples' => ManyManyExample::class,
    ];

    private static $has_many = [
        // Each HasManyExample record in this relationship will be duplicated, and the new records will all have the
        // duplicated ParentObject record's ID in their has_one relation ID column.
        'HasManyExamples' => HasManyExample::class,
    ];

    private static $has_one = [
        // The HasOneExample record will be duplicated, and the new duplicated records will be related to one another.
        'HasOneExample' => HasOneExample::class,
    ];

    private static $cascade_duplicates = [
        'ManyManyExamples',
        'HasManyExamples',
        'HasOneExample',
    ];
}
```

When duplicating objects you can determine which relationships (if any) should be cascade-duplicated by passing specific values to the second argument of `duplicate()`.

By default (or by explicitly passing `null`) this will respect the `cascade_duplicates` configuration. Passing `false` results in only duplicating the record for which the method is being invoked. Passing an array of relation names will act as though the passed in relation names were in the `cascade_duplicates` configuration.

```php
$parent = ParentObject::get()->first();

// Only duplicate the `$parent` record
$dupe = $parent->duplicate(relations: false);

// Duplicate the `$parent` record, and cascade duplicate the "Children" relation
// (ignoring any cascade_duplicates configuration)
$dupe = $parent->duplicate(relations: ['Children']);
```

> [!NOTE]
> The first parameter in `duplicate()` is `$doWrite` and determines whether the new duplicate record(s) will be written to the database. The second parameter is `$relations`, and it works as described above.

## Adding relations

Adding new items to a relation works the same regardless if you're editing a `has_many` or a `many_many` relationship. They are
encapsulated by [`HasManyList`](api:SilverStripe\ORM\HasManyList) and [`ManyManyList`](api:SilverStripe\ORM\ManyManyList), both of which provide very similar APIs (e.g. an `add()`
and `remove()` method).

```php
$team = Team::get()->byId(1);

// create a new supporter
$supporter = Supporter::create();
$supporter->Name = 'Foo';
$supporter->write();

// add the supporter.
$team->Supporters()->add($supporter);
```

Note that `add()` and `remove()` happen instantaneously. You don't have to call `write()` on anything after using those methods.

> [!TIP]
> To set what record is in a `has_one` relation, just set the `<relation-name>ID` field - e.g: `$player->TeamID = $team->ID;`
>
> Don't forget to write the record (`$player->write();`)!

## Custom relations

You can use the ORM to get a filtered result list without writing any SQL. For example, this snippet gets you the
`Players` relation on a team, but only containing active players.

See [Filtering Results](/developer_guides/model/data_model_and_orm/#filtering-results) for more information.

```php
namespace App\Model;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $has_many = [
        'Players' => Player::class,
    ];

    public function getActivePlayers()
    {
        return $this->Players()->filter('Status', 'Active');
    }
    // ...
}
```

> [!WARNING]
> Adding new records to a filtered `RelationList` like in the example above doesn't automatically set the filtered
> criteria on the added record - the record is added to the relation but is otherwise unaltered.
>
> ```php
> $newPlayer = Player::create(['Status' => 'Inactive']);
> $newPlayer->write();
>
> $playersList = Team()->get_one()->Players()->filter('Status', 'Active');
> $playersList->add($newPlayer);
> // Still returns 'Inactive'
> $status = $newPlayer->Status;
> ```

## Relations on unsaved objects

You can also set `has_many` and `many_many` relations before the `DataObject` is saved. This behavior uses the
[UnsavedRelationList](api:SilverStripe\ORM\UnsavedRelationList) and converts it into the correct [`RelationList`](api:SilverStripe\ORM\RelationList) subclass when saving the `DataObject` for the first
time.

This unsaved lists will also recursively save any unsaved objects that they contain.

As these lists are not backed by the database, most of the filtering methods on `DataList` cannot be used on a list of
this type. As such, an `UnsavedRelationList` should only be used for setting a relation before saving an object, not
for displaying the objects contained in the relation.

## Validating relations

The [`RelationValidationService`](api:SilverStripe\Dev\Validation\RelationValidationService) can be used to check if your relations are set up according to best practices, and is very useful for debugging unexpected behaviour with relations. It is disabled by default.

To enable this service, set the following YAML configuration, which will give you validation output every time you run `dev/build`.

```yml
SilverStripe\Dev\Validation\RelationValidationService:
  output_enabled: true
```

By default, this service only inspects relations for classes which have either no namespace or a namespace beginning with `App\`. You can declare your own namespace prefixes by setting the `allow_rules` configuration:

```yml
SilverStripe\Dev\Validation\RelationValidationService:
  allow_rules:
    # using the "app" key you can override the default "App" namespace
    app: 'MyApp'
    # you can add any namespace declarations with-or-without keys
    - 'MyOrg'
    # you can declare as much of of a namespace as you want - only classes which begin with
    # any one of the mentioned namespace prefixes will be allowed.
    - 'AnotherOrg\MyModule'
```

You can also tell the service to ignore classes whose namespace starts a certain way:

```yml
SilverStripe\Dev\Validation\RelationValidationService:
  deny_rules:
    - 'MyApp\SpecialCases'
```

If you have relations that you've intentionally set up in a way that the validation service warns against, you can tell it to ignore those specific relations by setting `deny_relations` config. Syntax for this is `<class>.<relation>`.

```yml
SilverStripe\Dev\Validation\RelationValidationService:
  deny_relations:
    - 'App\Model\Player.Teams'
```

### Validating relations outside dev/build

If you want to, you can invoke the `RelationValidationService` at any time in PHP code.

```php
use SilverStripe\Dev\Validation\RelationValidationService;

$messages = RelationValidationService::singleton()->validateRelations();
```

If you are doing this to debug some specific class(es), you might want to use the `inspectClasses()` method, which disregards the `allow_rules`, `deny_rules`, and `deny_relations` configuration specified above.

```php
use SilverStripe\Dev\Validation\RelationValidationService;

$messages = RelationValidationService::singleton()->inspectClasses([Team::class, Player::class]);
```

## Link tracking

You can control the visibility of the `Link Tracking` tab by setting the `show_sitetree_link_tracking` config.
This defaults to `false` for most `DataObject`'s.

It is also possible to control the visibility of the `File Tracking` tab by setting the `show_file_link_tracking` config.

## Related lessons

- [Working with data relationships -- has_many](https://www.silverstripe.org/learn/lessons/v4/working-with-data-relationships-has-many-1)
- [Working with data relationships -- many_many](https://www.silverstripe.org/learn/lessons/v4/working-with-data-relationships-many-many-1)

## Related documentation

- [Introduction to the Data Model and ORM](data_model_and_orm)
- [Lists](lists)
- [HasManyList](api:SilverStripe\ORM\HasManyList)
- [ManyManyList](api:SilverStripe\ORM\ManyManyList)
- [ManyManyThroughList](api:SilverStripe\ORM\ManyManyThroughList)
- [DataObject](api:SilverStripe\ORM\DataObject)
- [LinkTracking](api:SilverStripe\CMS\Model\SiteTreeLinkTracking)
