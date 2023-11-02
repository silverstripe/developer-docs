---
title: How to use a FixtureFactory
summary: Provide context to your tests with database fixtures
icon: industry
---

# How to use a fixtureFactory

The [FixtureFactory](api:SilverStripe\Dev\FixtureFactory) is used to manually create data structures for use with tests. For more information on fixtures
see the [Fixtures](../fixtures) documentation.

In this how to we'll use a `FixtureFactory` and a custom blue print for giving us a shortcut for creating new objects
with information that we need.

```php
namespace App\Test;

use App\Model\MyObject;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Dev\SapphireTest;

class MyObjectTest extends SapphireTest
{
    protected FixtureFactory $factory;

    public function __construct()
    {
        parent::__construct();

        $factory = Injector::inst()->create(FixtureFactory::class);

        // Defines a "blueprint" for new objects
        $factory->define(MyObject::class, [
            'MyProperty' => 'My Default Value',
        ]);

        $this->factory = $factory;
    }

    public function testSomething()
    {
        $MyObjectObj = $this->factory->createObject(
            MyObject::class,
            ['MyOtherProperty' => 'My Custom Value']
        );

        echo $MyObjectObj->MyProperty;
        // returns "My Default Value"

        echo $MyObjectObj->MyOtherProperty;
        // returns "My Custom Value"
    }
}
```

## Related documentation

- [Fixtures](../fixtures)

## API documentation

- [FixtureFactory](api:SilverStripe\Dev\FixtureFactory)
- [FixtureBlueprint](api:SilverStripe\Dev\FixtureBlueprint)
