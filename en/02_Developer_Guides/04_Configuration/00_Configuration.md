---
title: Configuration API
summary: Silverstripe CMS's YAML based Configuration API for setting runtime configuration.
icon: laptop-code
---

# Configuration API

Silverstripe CMS comes with a comprehensive code based configuration system through the [`Config`](api:SilverStripe\Core\Config\Config) class. It primarily
relies on declarative [YAML](https://en.wikipedia.org/wiki/YAML) files, and falls back to procedural PHP code, as well
as PHP static variables. This is provided by the [silverstripe/config](https://github.com/silverstripe/silverstripe-config)
library.

The Configuration API can be seen as separate from other forms of variables in the Silverstripe CMS system due to three
properties API:

- Configuration is **per class**, not per instance.
- Configuration is normally set once during initialization and then not changed.
- Configuration is normally set by a knowledgeable technical user, such as a developer, not the end user.

> [!WARNING]
> For providing content editors or CMS users a place to manage configuration see the [SiteConfig](siteconfig) module.

## Configuration properties

Configuration values are private static properties on any PHP class. These should be at the top of the class.
The typical naming convention for configuration properties is `lower_case_with_underscores`.

Any class defining configuration properties should use the [`Configurable`](api:SilverStripe\Core\Config\Configurable) trait.

```php
namespace App;

use SilverStripe\Core\Config\Configurable;

class MyClass
{
    use Configurable;

    private static $option_one = true;

    private static $option_two = ['Foo'];
}
```

> [!NOTE]
> Generally speaking, a private static property in Silverstripe CMS means a configuration property.
> If you want a private static property that has no interactions with the configuration API, you can
> mark it `@internal` in the property's PHPdoc.
>
> ```php
> namespace App;
>
> use SilverStripe\Core\Config\Configurable;
>
> class MyClass
> {
>     use Configurable;
>
>     /**
>      * @internal
>      */
>     private static $not_config;
> }
> ```

## Accessing configuration properties

This can be done by calling the static method [Config::inst()](api:SilverStripe\Core\Config\Config::inst()), like so:

```php
$config = Config::inst()->get(MyClass::class, 'property');
```

Or through the [`config()`](api:SilverStripe\Core\Config\Configurable::config()) method on the class (assuming the class uses the [`Configurable`](api:SilverStripe\Core\Config\Configurable) trait).

```php
$config = MyClass::config()->get('property');
$config = static::config()->get('property');
```

Note that while both objects have similar methods the APIs differ slightly. The below actions are equivalent:

- `Config::inst()->get(MyClass::class, 'property');` or `MyClass::config()->get('property')` - gets the value of the configuration property whether it was set on this class or one of its ancestors
- `Config::inst()->uninherited(MyClass::class, 'property');` or `MyClass::config()->get('property', Config::UNINHERITED)` - gets the value of the configuration property only if it was defined for the specific class passed in

You can also check whether a class has a value for a configuration property using the following syntax:

```php
Config::inst()->exists(MyClass::class, 'property');
```

## Setting configuration properties

### At runtime

Note that by default `Config::inst()` returns only an immutable version of config. Use [`Config::modify()`](api:SilverStripe\Core\Config\Config::modify())
if it's necessary to alter class config. This is generally undesirable in most applications, as modification
of the config can immediately have performance implications, so this should be used sparingly, or
during testing to modify state.

If you do need to modify configuration at run time, you can do so using the following API:

- `Config::modify()->merge(MyClass::class, 'property', 'newvalue');` or `MyClass::config()->merge('property', 'newvalue')` - merges the new configuration value in with any pre-existing values for this property
- `Config::modify()->set(MyClass::class, 'property', 'newvalue');` or `MyClass::config()->set('property', 'newvalue')` - overrides any existing values for this property with the new value
- `Config::modify()->remove(MyClass::class, 'property');` or `MyClass::config()->remove('property')` - completely removes the configuration property such that the `exists()` syntax above returns `false`.

### Ahead of time

Configuration values should generally be set ahead of time, either as default values directly being assigned to the private static properties, or via YAML.

To set those configuration options on our previously defined class we can define it in a `YAML` file.

```yml
# app/_config/app.yml
App\MyClass:
  option_one: false
  option_two:
    - Bar
    - Baz
```

> [!TIP]
> See [Configuration YAML Syntax and Rules](#configuration-yaml-syntax-and-rules) below for more information about the YAML configuration syntax.

The values we've defined in YAML are *merged* with the existing configuration (see [Configuration Values](#configuration-values) below):

```php
use App\MyClass;

// prints false
echo MyClass::config()->get('option_one');

// prints 'Foo, Bar, Baz'
echo implode(', ', MyClass::config()->get('option_two'));
```

> [!WARNING]
> There is no way currently to restrict read or write access to any configuration property, or influence/validate the values
> being read or written.

## Configuration values

Each configuration property can contain either a literal value (`'foo'`), integer (`2`), boolean (`true`), `null`, or an array.
If the value is an array, each value in the array may also be one of those types. Arrays can be either associative or indexed.

The value of any specific class configuration property comes from several sources. These sources do not override each
other - instead the values from each source are merged together to give the final configuration value, using these
rules:

- If the value is an array, each array is added to the *beginning* of the composite array in ascending priority order.
- If a higher priority item has a non-integer key which is the same as a lower priority item, the value of those items
  is merged using these same rules, and the result of the merge is located in the same location the higher priority item
  would be if there was no key clash.
- Other than in this key-clash situation, within the particular array, order is preserved.
- To override a value that is an indexed array, the entire value must first be set to `null`, and then set again to the new array.
    ```yml
    ---
    Name: arrayreset
    ---
    Class\With\Array\Config:
      an_array: null
    ---
    Name: array
    After: arrayreset
    ---
    Class\With\Array\Config:
      an_array: ['value_a', 'value_b']
    ```
- If the value is not an array, the highest priority value is used without any attempt to merge

> [!CAUTION]
> The exception to this is "falsey" values - empty arrays, empty strings, etc. When merging a truthy value with
> a falsey value, the result will be the truthy value regardless of priority. When merging two falsey values
> the result will be the higher priority falsey value.

The locations that configuration values are taken from in highest to lowest priority order are:

- Runtime modifications, ie: any values set via a call to `Config::inst()->update()`
- The configuration values taken from the YAML files in `_config/` directories (internally sorted in before / after
  order, where the item that is latest is highest priority)
- Any static set on the class named the same as the name of the property
- The composite configuration value of the parent class of this class
- Any static set on an "additional static source" class (such as an extension) named the same as the name of the property

> [!WARNING]
> It is incorrect to have mixed types of the same named property in different locations - but an error will not necessarily
> be raised due to optimizations in the lookup code.

## Configuration masks

At some of these levels you can also set masks. These remove values from the composite value at their priority point
rather than add.

```php
use SilverStripe\Core\Config\Config;

$actionsWithoutExtra = $this->config()->get(
    'allowed_actions',
    Config::UNINHERITED
);
```

Available masks include:

- Config::UNINHERITED - Exclude config inherited from parent classes
- Config::EXCLUDE_EXTRA_SOURCES - Exclude config applied by extensions

You can also pass in literal `true` to disable all extra sources, or merge config options with
bitwise `|` operator.

## Configuration YAML syntax and rules

> [!CAUTION]
> YAML files can not be placed any deeper than 2 directories deep. This will only affect you if you nest your modules deeper than the top level of your project.

Each module can have a directory immediately underneath the main module directory called `_config/`. Inside this
directory you can add YAML files that contain values for the configuration system.

> [!NOTE]
> The name of the files within the project's `_config/` directly are arbitrary. Our examples use
> `app/_config/app.yml` but you can break this file down into smaller files, or clearer patterns like `extensions.yml`,
> `email.yml` if you want.

### Syntax

The structure of each YAML file is a series of headers and values separated by YAML document separators (`---`).

```yml
---
Name: adminroutes
After:
    - '#rootroutes'
    - '#coreroutes'
---
SilverStripe\Control\Director:
  rules:
    'admin': 'SilverStripe\Admin\AdminRootController'
---
```

The header typically includes the name of this value set and some rules which apply to it - e.g. to evaluate this value set
before or after some other named set.

> [!NOTE]
> If there is only one set of values and you don't want any rules to apply to the value set, the header can be omitted.

Each value set of a YAML file implicitly has a reference path which is made up of the module name, the config file name,
and a fragment identifier. Reference paths look like this: `module/file#fragment` - e.g `admin/routes#adminroutes`.

- "module" is the name of the module this YAML file is in - note that this currently exclude the vendor portion of the module name (e.g. `silverstripe/admin` is shortened down to `admin`).
- "file" is the name of this YAML file, stripped of the extension (so for routes.yml, it would be routes).
- "fragment" is a specified identifier. It is specified by putting a `Name: {fragment}` key / value pair into the
header section. If you don't specify a name, a random one will be assigned.

This reference path has no affect on the value section itself, but is how other header sections refer to this value
section in their priority chain rules.

### Rules

Rules come in two main forms:

- A set of rules for the value section's priority relative to other value sections. These are the [`Before`/`After` rules](#before-after-rules).
- A set of rules that might exclude the value section from being used. These are the [exclusionary rules](#exclusionary-rules).

#### Before / after priorities {#before-after-rules}

Values for a specific class property can be specified in several value sections across several modules. These values are
merged together using the same rules as the configuration system as a whole.

However, there is no inherent priority amongst the various value sections - by default they're simply merged in the order they're processed.

To control the priority of your configuration, each value section can have rules that indicate priority. These rules state that this value section must come
before (lower priority than) or after (higher priority than) some other value section.

To specify these rules you add an `After` and/or `Before` key to the relevant header section. The value for these
keys is a list of reference paths to other value sections. A basic example:

```yml
---
Name: adminroutes
Before: '*'
After:
    - '#rootroutes'
---
SilverStripe\Control\Director:
  rules:
    'admin': 'SilverStripe\Admin\AdminRootController'
---
```

You do not have to specify all portions of a reference path. Any portion may be replaced with a wildcard `'*'`, or left
out all together. Either has the same affect - that portion will be ignored when checking a value section's reference
path, and will always match. You may even specify just `'*'`, which means "all value sections".

> [!WARNING]
> Be careful when using wildcards, as this can result in circular dependencies. An error will be thrown if that happens.

When a particular value section matches both a `Before` *and* an `After` rule, this may be a problem. Clearly
one value section can not be both before *and* after another. However when you have used wildcards, if there
was a difference in how many wildcards were used, the one with the least wildcards will be kept and the other one
ignored.

The value section above has two rules:

- It must be merged in before (lower priority than) all other value sections
- It must be merged in after (higher priority than) any value section with a fragment name of "rootroutes"

In this case there would appear to be a problem - adminroutes can not be both before all other value sections *and*
after value sections with a name of `rootroutes`. However because `'*'` implicitly has three wildcards
(it is the equivalent of `'*/*#*'`) but `#rootroutes` only has two (it is the equivalent of `'*/*#rootroutes'`), the `Before`
rule ultimately gets evaluated as meaning "every value section *except* ones that have a fragment name of rootroutes".

> [!CAUTION]
> It is possible to create chains that are unsolvable. For instance, A must be before B, B must be before C, C must be
> before A. In this case you will get an error when accessing your site.

#### Exclusionary rules

Some value sections might only make sense under certain environmental conditions - a class exists, a module is
installed, an environment variable or constant is set, or Silverstripe CMS is running in a certain environment mode (live,
dev, etc).

To accommodate this, value sections can be filtered to only be used when either a rule matches or doesn't match the
current environment.

To achieve this, add a key to the related header section, either `Only` when the value section should be included
only when all the rules contained match, or `Except` when the value section should be included except when all of the
rules contained match.

You then list any of the following rules as sub-keys, with informational values as either a single value or a list.

- `classexists`, in which case the value(s) should be classes that must exist
- `moduleexists`, in which case the value(s) should be modules that must exist. This supports either folder
    name or composer `vendor/name` format.
- `environment`, in which case the value(s) should be one of "live", "test" or "dev" to indicate the Silverstripe CMS
    mode the site must be in
- `envvarset`, in which case the value(s) should be environment variables that must be set
- `constantdefined`, in which case the value(s) should be constants that must be defined
- `envorconstant`, a variable which should be defined either via environment vars or constants (and optionally be set to a specific value)
- `extensionloaded`, in which case the PHP extension(s) must be loaded

For instance, to add a property to "foo" when a module exists, and "bar" otherwise, you could do this:

```yml
---
Only:
  moduleexists: 'silverstripe/blog'
---
App\MyClass:
  property: 'foo'

---
Except:
  moduleexists: 'silverstripe/blog'
---
App\MyClass:
  property: 'bar'
```

Multiple conditions of the same type can be declared via array format for all of these rules

```yml
---
Only:
  moduleexists:
    - 'silverstripe/blog'
    - 'silverstripe/lumberjack'
---
```

The `envorconstant` rule allows you to get even more specific by also directly comparing values of environment variables
and constants. In this example, both `TEST_ENV` and `TEST_CONST` have to be defined *and* set to certain values:

```yml
---
Only:
  envorconstant:
    TEST_ENV: 'example'
    TEST_CONST: true
---
```

> [!CAUTION]
> When you have more than one rule for a nested fragment, they're joined like
> `FRAGMENT_INCLUDED = (ONLY && ONLY) && !(EXCEPT && EXCEPT)`.
> That is, the fragment will be included if all Only rules match, except if all Except rules match.

## Unit tests

Sometimes, it's necessary to change a configuration value in your unit tests.
One way to do this is to use the `withConfig` method.
This is especially handy when using data providers.
Example below shows one unit test using a data provider.
This unit test changes configuration before testing functionality.
The test will run three times, each run with different configuration value.
Note that the configuration change is active only within the callback function.

```php
namespace App\Test\Service;

use App\Service\MyService;
use SilverStripe\Config\Collections\MutableConfigCollectionInterface;
use SilverStripe\Core\Config\Config;
use SilverStripe\Dev\SapphireTest;

class MyServiceTest extends SapphireTest
{
    /**
     * @dataProvider testValuesProvider
     * @param string $value
     * @param string $expected
     */
    public function testConfigValues($value, $expected)
    {
        $result = Config::withConfig(function (MutableConfigCollectionInterface $config) use ($value) {
            // update your config
            $config->set(MyService::class, 'some_setting', $value);

            // your test code goes here and it runs with your changed config
            return MyService::singleton()->executeSomeFunction();
        });

        // your config change no longer applies here as it's outside of callback

        // assertions can be done here but also inside the callback function
        $this->assertEquals($expected, $result);
    }

    public function testValuesProvider(): array
    {
        return [
            ['test value 1', 'expected value 1'],
            ['test value 2', 'expected value 2'],
            ['test value 3', 'expected value 3'],
        ];
    }
}
```

## API documentation

- [Config](api:SilverStripe\Core\Config\Config)
