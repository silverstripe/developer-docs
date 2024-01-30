---
title: Fixtures
summary: Populate test databases with fake seed data.
---

# Fixtures

To test functionality correctly, we must use consistent data. If we are testing our code with the same data each
time, we can trust our tests to yield reliable results and to identify when the logic changes. Each test run in
Silverstripe CMS starts with a fresh database containing no records. `Fixtures` provide a way to describe the initial data
to load into the database. The [SapphireTest](api:SilverStripe\Dev\SapphireTest) class takes care of populating a test database with data from
fixtures - all we have to do is define them.

To include your fixture file in your tests, you should define it as your `$fixture_file`:

```php
// app/tests/MyNewTest.php
namespace App\Test;

use SilverStripe\Dev\SapphireTest;

class MyNewTest extends SapphireTest
{
    protected static $fixture_file = 'fixtures.yml';

    // ...
}
```

You can also use an array of fixture files, if you want to use parts of multiple other tests.

If you are using [`TestOnly`](api:SilverStripe\Dev\TestOnly) dataobjects in your fixtures, you must
declare these classes within the $extra_dataobjects variable.

```php
// app/tests/MyNewTest.php
namespace App\Test;

use SilverStripe\Dev\SapphireTest;

class MyNewTest extends SapphireTest
{
    protected static $fixture_file = [
        'fixtures.yml',
        'otherfixtures.yml',
    ];

    protected static $extra_dataobjects = [
        Player::class,
        Team::class,
    ];

    // ...
}
```

Typically, you'd have a separate fixture file for each class you are testing - although overlap between tests is common.

Fixtures are defined in `YAML`. `YAML` is a markup language which is deliberately simple and easy to read, so it is
ideal for fixture generation. Say we have the following two DataObjects:

```php
namespace App\Test;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;

class Player extends DataObject implements TestOnly
{
    private static $db = [
        'Name' => 'Varchar(255)',
    ];

    private static $has_one = [
        'Team' => Team::class,
    ];
}
```

```php
namespace App\Test;

use SilverStripe\Dev\TestOnly;
use SilverStripe\ORM\DataObject;

class Team extends DataObject implements TestOnly
{
    private static $db = [
        'Name' => 'Varchar(255)',
        'Origin' => 'Varchar(255)',
    ];

    private static $has_many = [
        'Players' => Player::class,
    ];
}
```

We can represent multiple instances of them in `YAML` as follows:

```yml
# app/tests/fixtures.yml
App\Test\Team:
  hurricanes:
    Name: The Hurricanes
    Origin: Wellington
  crusaders:
    Name: The Crusaders
    Origin: Canterbury
App\Test\Player:
  john:
    Name: John
    Team: =>App\Test\Team.hurricanes
  joe:
    Name: Joe
    Team: =>App\Test\Team.crusaders
  jack:
    Name: Jack
    Team: =>App\Test\Team.crusaders
```

This `YAML` is broken up into three levels, signified by the indentation of each line. In the first level of
indentation, `Player` and `Team`, represent the class names of the objects we want to be created.

The second level, `john`/`joe`/`jack` & `hurricanes`/`crusaders`, are **identifiers**. Each identifier you specify
represents a new object and can be referenced in the PHP using `objFromFixture`

```php
use App\Test\Player;

$player = $this->objFromFixture(Player::class, 'jack');
```

The third and final level represents each individual object's fields.

A field can either be provided with raw data (such as the names for our Players), or we can define a relationship, as
seen by the fields prefixed with `=>`.

Each one of our Players has a relationship to a Team, this is shown with the `Team` field for each `Player` being set
to `=>App\Test\Team.` followed by a team name.

Take the player John in our example YAML below, his team is the Hurricanes which is represented by `=>App\Test\Team.hurricanes`. This
sets the `has_one` relationship for John with with the `Team` object `hurricanes`.

> [!TIP]
> Note that we use the name of the relationship (Team), and not the name of the
> database field (TeamID).

This style of relationship declaration can be used for any type of relationship (i.e. `has_one`, `has_many`, `many_many`).

We can also declare the relationships conversely. Another way we could write the previous example is:

```yml
App\Test\Player:
  john:
    Name: John
  joe:
    Name: Joe
  jack:
    Name: Jack
App\Test\Team:
  hurricanes:
    Name: Hurricanes
    Origin: Wellington
    Players: =>App\Test\Player.john
  crusaders:
    Name: Crusaders
    Origin: Canterbury
    Players: =>App\Test\Player.joe,=>App\Test\Player.jack
```

> [!WARNING]
> Be aware the target of a relationship must be defined before it is referenced, for example the `hurricanes` team must appear in the fixture file before the line `Team: =>App\Test\Team.hurricanes`.

The database is populated by instantiating `DataObject` objects and setting the fields declared in the `YAML`, then
calling `write()` on those objects. Take for instance the `hurricances` record in the `YAML`. It is equivalent to
writing:

```php
use App\Test\Team;

$team = Team::create([
    'Name' => 'Hurricanes',
    'Origin' => 'Wellington',
]);

$team->write();

$team->Players()->add($john);
```

> [!WARNING]
> As the YAML fixtures will call `write`, any `onBeforeWrite()` or default value logic will be executed as part of the
> test.

## Fixtures for namespaced classes

As of Silverstripe CMS 4 you will need to use fully qualified class names in your YAML fixture files. In the above examples, they belong to the global namespace so there is nothing requires, but if you have a deeper DataObject, or it has a relationship to models that are part of the framework for example, you will need to include their namespaces:

```yml
App\Test\Player:
  john:
    Name: join
App\Test\Team:
  crusaders:
    Name: Crusaders
    Origin: Canterbury
    Players: =>App\Test\Player.john
```

> [!WARNING]
> If your tests are failing and your database has table names that follow the fully qualified class names, you've probably forgotten to implement `private static $table_name = 'Player';` on your namespaced class. This property was introduced in Silverstripe CMS 4 to reduce data migration work. See [DataObject](api:SilverStripe\ORM\DataObject) for an example.

## Defining many_many_extraFields

`many_many` relations can have additional database fields attached to the relationship. For example we may want to
declare the role each player has in the team.

```php
namespace App\Test;

use SilverStripe\ORM\DataObject;

class Player extends DataObject
{
    private static $db = [
        'Name' => 'Varchar(255)',
    ];

    private static $belongs_many_many = [
        'Teams' => Team::class,
    ];
}
```

```php
namespace App\Test;

use SilverStripe\ORM\DataObject;

class Team extends DataObject
{
    private static $db = [
        'Name' => 'Varchar(255)',
    ];

    private static $many_many = [
        'Players' => Player::class,
    ];

    private static $many_many_extraFields = [
        'Players' => [
            'Role' => 'Varchar',
        ],
    ];
}
```

To provide the value for the `many_many_extraField` use the YAML list syntax.

```yml
App\Test\Player:
  john:
    Name: John
  joe:
    Name: Joe
  jack:
    Name: Jack
App\Test\Team:
  hurricanes:
    Name: The Hurricanes
    Players:
      - =>App\Test\Player.john:
         Role: Captain

  crusaders:
    Name: The Crusaders
    Players:
      - =>App\Test\Player.joe:
        Role: Captain
      - =>App\Test\Player.jack:
        Role: Winger
```

## Fixture factories

While manually defined fixtures provide full flexibility, they offer very little in terms of structure and convention.

Alternatively, you can use the [FixtureFactory](api:SilverStripe\Dev\FixtureFactory) class, which allows you to set default values, callbacks on object
creation, and dynamic/lazy value setting.

> [!TIP]
> `SapphireTest` uses `FixtureFactory` under the hood when it is provided with YAML based fixtures.

The idea is that rather than instantiating objects directly, we'll have a factory class for them. This factory can have
*blueprints* defined on it, which tells the factory how to instantiate an object of a specific type. Blueprints need a
name, which is usually set to the class it creates such as `Member` or `Page`.

Blueprints are auto-created for all available DataObject subclasses, you only need to instantiate a factory to start
using them.

```php
use App\Test\Team;
use SilverStripe\Core\Injector\Injector;

$factory = Injector::inst()->create('FixtureFactory');

$obj = $factory->createObject(Team::class, 'hurricanes');
```

In order to create an object with certain properties, just add a third argument:

```php
use App\Test\Team;

$obj = $factory->createObject(Team::class, 'hurricanes', [
    'Name' => 'My Value',
]);
```

> [!WARNING]
> It is important to remember that fixtures are referenced by arbitrary identifiers ('hurricanes'). These are internally
> mapped to their database identifiers.

After we've created this object in the factory, `getId` is used to retrieve it by the identifier.

```php
use App\Test\Team;

$databaseId = $factory->getId(Team::class, 'hurricanes');
```

### Default properties

Blueprints can be overwritten in order to customise their behavior. For example, if a Fixture does not provide a Team
name, we can set the default to be `Unknown Team`.

```php
use App\Test\Team;

$factory->define(Team::class, [
    'Name' => 'Unknown Team',
]);
```

### Dependent properties

Values can be set on demand through anonymous functions, which can either generate random defaults, or create composite
values based on other fixture data.

```php
use SilverStripe\Security\Member;

$factory->define(
    Member::class,
    [
        'Email' => function ($obj, $data, $fixtures) {
            if (isset($data['FirstName'])) {
                $obj->Email = strtolower($data['FirstName']) . '@example.com';
            }
        },
        'Score' => function ($obj, $data, $fixtures) {
            $obj->Score = rand(0, 10);
        },
    ]
);
```

### Relations

Model relations can be expressed through the same notation as in the YAML fixture format described earlier, through the
`=>` prefix on data values.

```php
use App\Test\Team;

$obj = $factory->createObject(Team::class, 'hurricanes', [
    'MyHasManyRelation' => '=>App\Test\Player.john,=>App\Test\Player.joe',
]);
```

#### Callbacks

Sometimes new model instances need to be modified in ways which can't be expressed in their properties, for example to
publish a page, which requires a method call.

```php
$blueprint = Injector::inst()->create('FixtureBlueprint', 'Member');

$blueprint->addCallback('afterCreate', function ($obj, $identifier, $data, $fixtures) {
    $obj->copyVersionToStage(Versioned::DRAFT, Versioned::LIVE);
});

$page = $factory->define(Page::class, $blueprint);
```

Available callbacks:

- `beforeCreate($identifier, $data, $fixtures)`
- `afterCreate($obj, $identifier, $data, $fixtures)`

### Multiple blueprints

Data of the same type can have variations, for example forum members vs. CMS admins could both inherit from the `Member`
class, but have completely different properties. This is where named blueprints come in. By default, blueprint names
equal the class names they manage.

```php
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Dev\FixtureBlueprint;
use SilverStripe\Security\Group;
use SilverStripe\Security\Member;

$memberBlueprint = Injector::inst()->create(FixtureBlueprint::class, 'Member', Member::class);

$adminBlueprint = Injector::inst()->create(FixtureBlueprint::class, 'AdminMember', Member::class);

$adminBlueprint->addCallback('afterCreate', function ($obj, $identifier, $data, $fixtures) {
    if (isset($fixtures['Group']['admin'])) {
        $adminGroup = Group::get()->byId($fixtures['Group']['admin']);
        $obj->Groups()->add($adminGroup);
    }
});

// not in admin group
$member = $factory->createObject('Member');

// in admin group
$admin = $factory->createObject('AdminMember');
```

## Related documentation

- [How to use a FixtureFactory](how_tos/fixturefactories/)

## API documentation

- [FixtureFactory](api:SilverStripe\Dev\FixtureFactory)
- [FixtureBlueprint](api:SilverStripe\Dev\FixtureBlueprint)
