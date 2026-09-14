---
title: Dependency Injection
summary: Introduction to using Dependency Injection within Silverstripe CMS.
icon: code
---

# Dependency injection

> ...dependency injection is a design pattern in which an object or function receives other objects or functions that it depends on
[Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection)

In Silverstripe a combination of the [Injector API](#injector) and the [Configuration API](../configuration) provide a comprehensive dependency injection pattern.
Some of the goals of dependency injection are:

- Simplified instantiation of objects
- Providing a uniform way of declaring and managing inter-object dependencies
- Promoting abstraction of logic

In practical terms it allows developers to:

- Make class dependencies configurable rather than hard-coded
- Override or replace core behaviour without needing to alter core code
- Write more testable code

## `Injector`

The [Injector](api:SilverStripe\Core\Injector\Injector) class is the central manager of inter-class dependencies in Silverstripe CMS. It offers developers the
ability to declare the dependencies a class type has, or to change the nature of the dependencies defined by other
developers.

### Basic usage

The following snippet shows `Injector` creating a new object of type `App\MyClient` through its `create` method:

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->create(MyClient::class);
```

Repeated calls to `create()` create a new object each time.

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->create(MyClient::class);
$object2 = Injector::inst()->create(MyClient::class);

// resolves to false
$object === $object2;
```

Arguments can be passed to the constructor of the object being instantiated by passing them in to `create()`. The method takes a variable-length argument list so you can pass in as many arguments as you need to the constructor.

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->create(MyClient::class, $arg1, $arg2);
```

Note that for classes that use the [`Injectable`](api:SilverStripe\Core\Injector\Injectable) trait, there is a simpler syntax for this and for the singleton pattern mentioned below. See [Injectable Trait](#injectable-trait) below for details.

### Singleton pattern

The `Injector` API can be used for the [singleton pattern](https://en.wikipedia.org/wiki/Singleton_pattern) through `get()`. Unlike `create()` subsequent calls to `get` return the same object instance as the first call.

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

// Fetches MyClient as a singleton
$object = Injector::inst()->get(MyClient::class);
$object2 = Injector::inst()->get(MyClient::class);

// resolves to true
$object === $object2;
```

As with `create()`, you can pass as many arguments as you need to the instantiated singleton by passing them into `get()` - but you'll need to pass them in as an array to the third argument or as a named `$constructorArgs` argument, since `get()`'s second argument is a boolean to determine whether the instantiated object is a singleton or not.

> [!NOTE]
> The arguments passed in for the singleton's constructor will only take effect the first time the singleton is instantiated - after that, because it is a singleton and has therefore already been instantiated, the constructor arguments will be ignored.

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

// sets up MyClient as a singleton
$object = Injector::inst()->get(MyClient::class, constructorArgs: [$arg1, $arg2]);
```

#### Prototype services are never singletons

It is possible to tell `Injector` to always instantiate a new object for a given service even if it's requested it as a singleton.
This is particularly useful when a service is intended to be [declared as a dependency](#dependencies-and-properties) for some other class, and you don't want that dependency to be a singleton.

This is done by setting the 'type' for a given service definition to "prototype" in YAML configuration like so:

```yml
SilverStripe\Core\Injector\Injector:
  App\MyClient:
    type: 'prototype'
```

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

// Instantiates new MyClient objects each time, even though this would normally fetch a singleton
$object = Injector::inst()->get(MyClient::class);
$object2 = Injector::inst()->get(MyClient::class);

// resolves to false
$object === $object2;
```

## Basic dependency injection

The benefit of constructing objects via dependency injection is that the object that the injector returns for `App\MyClient` can be changed by subsequent code or configuration, for example:

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

// A default client singleton is created and registered - could be in core code
Injector::inst()->registerService(new ReadClient(), MyClient::class);
$client = Injector::inst()->get(MyClient::class);
// $client is an instance of ReadClient

// somewhere later, perhaps in some application code, a new singleton is registered to replace the old one
Injector::inst()->registerService(new WriteClient(), MyClient::class);
$client = Injector::inst()->get(MyClient::class);
// $client is now an instance of WriteClient
```

> [!NOTE]
> Note that `App\MyClient` [does not have to be an existing class](#service-inheritance) - you can use abitrary strings to identify singleton services. That said, using existing classes can be easier to reason about and can be refactored by automatic tools/IDEs - along with providing a valid default class to use if one is not explicitly registered.

Using Injector imperatively like this is most common [in testing](#testing-with-injector). Usually, the configuration API is used instead.

## Injector API 🤝 configuration API {#injector-via-config}

The Injector API combined with the Configuration API is a powerful way to declare and manage dependencies in your code. For example, `App\MyClient` can be swapped out using the following config:

```yml
# app/_config/class-overrides.yml
SilverStripe\Core\Injector\Injector:
  App\MyClient:
    class: App\MyBetterClient
```

We can then get use the `Injector`'s PHP API to fetch the `App\MyClient` singleton, which will be an instance of `App\MyBetterClient`:

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

/** @var App\MyBetterClient $object */
$object = Injector::inst()->get(MyClient::class);
```

This allows you to concisely override classes in Silverstripe core or other third-party Silverstripe code.

> [!NOTE]
> When overriding other configuration beware the [order that configuration is applied](../configuration/#configuration-values). You may have to use the [Before/After](../configuration/#before-after-rules) syntax to apply your override.

### Special YAML syntax

You can use the special `%$` prefix in the injector configuration yml to fetch items via the Injector. For example:

```yml
SilverStripe\Core\Injector\Injector:
  App\Services\MediumQueuedJobService:
    properties:
      queueRunner: '%$App\Tasks\Engines\MediumQueueAsyncRunner'
```

It is equivalent of calling `Injector::inst()->get('App\Tasks\Engines\MediumQueueAsyncRunner')` and assigning the result to the `queueRunner` property of an instantiated `App\Services\MediumQueuedJobService` object (see [dependencies and properties](#dependencies-and-properties) below). This can be useful as these properties can be easily updated by changing what class is used for the `App\Tasks\Engines\MediumQueueAsyncRunner` singleton service (e.g if provided in a module or be changed for unit testing).

The special syntax can also be used to provide constructor arguments such as this example from the assets module:

```yml
SilverStripe\Core\Injector\Injector:
  League\Flysystem\Filesystem.protected:
    class: League\Flysystem\Filesystem
    constructor:
      FilesystemAdapter: '%$SilverStripe\Assets\Flysystem\ProtectedAdapter'
```

#### Using constants and environment variables

The Injector configuration has the special ability to include core constants or environment variables. They can be used by quoting with back ticks "`". Please ensure you also quote the entire value (see below).

```yml
SilverStripe\Core\Injector\Injector:
  CachingService:
    class: SilverStripe\Cache\CacheProvider
    properties:
      CacheDir: '`TEMP_DIR`'
```

Environment variables are used in the same way:

```yml
SilverStripe\Core\Injector\Injector:
  App\Services\MyService:
    class: App\Services\MyService
    constructor:
      baseURL: '`SS_API_URI`'
    credentials:
      id: '`SS_API_CLIENT_ID`'
      secret: '`SS_API_CLIENT_SECRET`'
```

> [!NOTE]
> Note: undefined variables will be replaced with null.

You can have multiple environment variables within a single value, though the overall value must start and end with backticks.

```yml
SilverStripe\Core\Injector\Injector:
  App\Services\MyService:
    properties:
      SingleVariableProperty: '`ENV_VAR_ONE`'
      MultiVariableProperty: '`ENV_VAR_ONE` and `ENV_VAR_TWO`'
      ThisWillNotSubstitute: 'lorem `REGULAR_TEXT` ipsum'
```

## Dependencies and properties

Silverstripe classes can declare a special `$dependencies` array which can quickly configure dependencies when used with the injector API. The `Injector` will evaluate the array values and assign the appropriate value to a property that matches the array key. For example:

> [!NOTE]
> Just like the YAML syntax discussed above, constants and environment variables can be substitutes in dependency values using backticks.

```php
namespace App\Control;

use SilverStripe\Control\Controller;
use ThirdParty\PermissionService;

class MyController extends Controller
{
    /**
     * Properties matching the array keys in $dependencies will be automatically
     * set by the injector on object creation.
     */
    // phpcs:ignore SlevomatCodingStandard.Classes.ForbiddenPublicProperty.ForbiddenPublicProperty
    public $textProperty;

    /**
     * Private properties must have an associated setter method for the injector
     * to call. In this case setDefaultText()
     */
    private $defaultText = '';

    /**
     * Services using the '%$' prefix will use the appropriate singleton, anything
     * else will be treated as a primitive.
     */
    private static $dependencies = [
        'permissions' => '%$' . PermissionService::class,
        'defaultText' => 'This will just be assigned as a string',
    ];

    public function setDefaultText(string $text)
    {
        $this->defaultText = $text;
    }

    public function getDefaultText(): string
    {
        return $this->defaultText;
    }
}
```

> [!NOTE]
> Note the properties set by `Injector` must be public properties, or have a public setter method.

When creating a new instance of `App\Control\MyController` via Injector the permissions property will contain an instance of the `ThirdParty\PermissionService` that was resolved by Injector, and the `defaultText` property will contain the string defined in the `$dependencies` array.

```php
use App\Control\MyController;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->get(MyController::class);

// prints 'ThirdParty\PermissionService'
echo get_class($object->permissions);

// prints 'This will just be assigned as a string'
echo $object->getDefaultText();
```

We can then change or override any of those dependencies via the [Configuration YAML](../configuration) and Injector does the hard work of wiring it up.

```yml
# app/_config/services.yml
SilverStripe\Core\Injector\Injector:
  ThirdParty\PermissionService:
    class: App\MyCustomPermissionService
  App\Control\MyController:
    properties:
      defaultText: 'Replaces the old text'
```

Now the dependencies will be replaced with our configuration.

```php
use App\Control\MyController;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->get(MyController::class);

// prints 'App\MyCustomPermissionService'
echo get_class($object->permissions);

// prints 'Replaces the old text'
echo $object->getDefaultText();
```

### Dependent calls

As well as properties, method calls the class depends on (i.e. method calls that should be done after instantiating the object) can also be specified via the `calls` property in YAML:

```yml
SilverStripe\Core\Injector\Injector:
  App\Logger:
    class: Monolog\Logger
    calls:
      - [pushHandler, ['%$App\Log\DefaultHandler']]
```

This configuration will mean that every time the `App\Logger` service is instantiated by injector the `pushHandler` method will be called with the arguments `['%$App\Log\DefaultHandler']` (which will be resolved by injector first, resulting in an instance of the `App\Log\DefaultHandler` service being passed into the method call).

Note that [configuration is merged](../configuration/#configuration-values) so there may be multiple calls to `pushHandler` from other configuration files.

### Managed objects

While dependencies can be specified in PHP with the `$dependencies` configuration property, it is common to define them in YAML - especially when there is a chain of dependencies and other related configuration which needs to be defined.

For example. assuming a class structure such as this:

```php
namespace App\Control;

class MyController
{
    private $permissions;

    private static $dependencies = [];

    public function setPermissions($permissions): static
    {
        $this->permissions = $permissions;
        return $this;
    }
}
```

```php
namespace App\Control;

class RestrictivePermissionService
{
    private $database;

    public function setDatabase($db): static
    {
        $this->database = $db;
    }
}
```

```php
namespace App\ORM;

class MySQLDatabase
{
    private $username;

    private $password;

    public function __construct($username, $password)
    {
        $this->username = $username;
        $this->password = $password;
    }
}
```

And the following configuration..

```yml
---
name: MyController
---
App\Control\MyController:
  dependencies:
    permissions: '%$PermissionService'
SilverStripe\Core\Injector\Injector:
  PermissionService:
    class: App\Control\RestrictivePermissionService
    properties:
      database: '%$App\ORM\MySQLDatabase'
  App\ORM\MySQLDatabase:
    constructor:
      0: '`dbusername`'
      1: '`dbpassword`'
```

Calling..

```php
use App\Control\MyController;
use SilverStripe\Core\Injector\Injector;

$controller = Injector::inst()->get(MyController::class);
```

Would perform the following steps:

- Fetches a singleton of the `App\Control\MyController` service
- If there no existing instance for the `App\Control\MyController` singleton:
  - Instantiates the service as an instance of the `App\Control\MyController` class
  - Look through the `dependencies` for the `App\Control\MyController` service and fetch a singleton of the `App\PermissionService` service
  - If there no existing instance for the `App\PermissionService` singleton:
    - Instantiates the service as an instance of the `App\RestrictivePermissionService` class
    - Look at the properties to be injected for the `App\PermissionService` service fetch a singleton of the `App\ORM\MySQLDatabase` service
    - If there no existing instance for the `App\ORM\MySQLDatabase` singleton:
      - Instantiates the service as an instance of the `App\ORM\MySQLDatabase` class
      - Evaluates and passes in the values of the constants or environment variables `dbusername` and `dbpassword` as arguments to the constructor
    - Sets the `App\ORM\MySQLDatabase` singleton as the private `database` property on the `App\PermissionService` singleton by passing it in to a call to the `setDatabase()` method
  - Sets the `App\PermissionService` singleton as the public `permissions` property on the `App\Control\MyController` singleton
- Returns the `App\Control\MyController` singleton

## Factories

Some services require non-trivial construction which means they must be created
by a factory.

### Factory interface

Create a factory class which implements the [Factory](api:SilverStripe\Core\Injector\Factory)
interface. You can then specify the `factory` key in the service definition,
and the factory service will be used.

An example using the `App\MyFactory` service to create instances of the `App\MyService` service is shown below:

```yml
# app/_config/services.yml
SilverStripe\Core\Injector\Injector:
  App\MyService:
    factory: App\MyFactory
```

```php
// app/src/MyFactory.php
namespace App;

use SilverStripe\Core\Injector\Factory;

class MyFactory implements Factory
{
    public function create(string $service, array $params = []): object
    {
        return new MyServiceImplementation(...$params);
    }
}
```

```php
use App\MyService;
use SilverStripe\Core\Injector\Injector;

// Uses App\MyFactory::create() to create the service instance, resulting in an instance of App\MyServiceImplementation
$instance = Injector::inst()->get(MyService::class);
```

> [!NOTE]
> For simplicity, the above example doesn't use the `$service` parameter, though it needs to be declared to match the method signature from the `Factory` interface.
>
> The `$service` parameter will hold the name of the service being requested, which allows you to use the same factory class for multiple different services if you want to. In the above example, the value would be `'App\MyService'`.
>
> The `$params` parameter will hold any constructor arguments that are passed into the `get()` method, as an array. In the above example it is simply an empty array.

### Factory method

To use any class that does not implement the `Factory` interface as a service factory
specify `factory` and `factory_method` keys to declare the class and method to be used.
The method can be (but does not have to be) a static method.

An example of HTTP Client service with extra logging middleware which uses factories to be instantiated:

```yml
# app/_config/services.yml
SilverStripe\Core\Injector\Injector:
  App\LogMiddleware:
    factory: 'GuzzleHttp\Middleware'
    factory_method: 'log'
    constructor:
      - '%$Psr\Log\LoggerInterface'
      - '%$GuzzleHttp\MessageFormatter'
      - 'info'
  GuzzleHttp\HandlerStack:
    factory: 'GuzzleHttp\HandlerStack'
    factory_method: 'create'
    calls:
      - [push, ['%$App\LogMiddleware']]
  GuzzleHttp\Client:
    constructor:
      -
        handler: '%$GuzzleHttp\HandlerStack'
```

## Service inheritance

By default, services registered with Injector do not inherit from one another; This is because it registers
named services, which may not be actual classes, and thus should not behave as though they were.

Thus if you want an object to have the injected dependencies of a service of another name, you must
assign a reference to that service. References are denoted by using a percent and dollar sign, like in the
YAML configuration example below.

```yml
SilverStripe\Core\Injector\Injector:
  App\JSONServiceDefinition:
    class: App\JSONServiceImplementor
    properties:
      Serialiser: App\JSONSerialiser
  App\GZIPJSONProvider: '%$App\JSONServiceDefinition'
```

With this configuration, `App\GZIPJSONProvider` is effectively an alias for the `App\JSONServiceDefinition` configuration.

It is important here to note that the `class` configuration of the parent service will be inherited only if it is explicitly specified.
If the `class` configuration isn't defined, then the class used defaults to the name of the service.

For example with this config:

```yml
SilverStripe\Core\Injector\Injector:
  App\Connector:
    properties:
      AsString: true
  App\ServiceConnector: '%$Connector'
```

Both `App\Connector` and `App\ServiceConnector` will have the `AsString` property set to true, but the resulting
instances will be classes which match their respective service names (i.e. `App\Connector` will be an instance of `App\Connector`,
and `App\ServiceConnector` will be an instance of `App\ServiceConnector`), due to the lack of a `class` specification
on either service definition.

## Testing with injector

In situations where service definitions must be temporarily overridden, it is possible to create nested Injector instances
which may be later discarded, reverting the application to the original state. This is done through `nest` and `unnest`.

This is useful when writing test cases, as certain services may be necessary to override for a single method call.

```php
use App\LiveService;
use App\MyService;
use App\TestingService;
use SilverStripe\Core\Injector\Injector;

// Setup default service
Injector::inst()->registerService(new LiveService(), MyService::class);

// Test substitute service temporarily
Injector::nest();

Injector::inst()->registerService(new TestingService(), MyService::class);
$service = Injector::inst()->get(MyService::class);
// ... do something with $service

// revert changes
Injector::unnest();
```

## Injectable trait

The [`Injectable`](api:SilverStripe\Core\Injector\Injectable) trait can be used to indicate your class is able to be used with Injector (though it is not required). It provides the `create` and `singleton` methods to shortcut creating objects through Injector.

For example with the following class:

```php
namespace App;

use SilverStripe\Core\Injector\Injectable;

class MyClass
{
    use Injectable;
}
```

you can instantiate it with:

```php
use App\MyClass;

// instantiate a new instance of App\MyClass via Injector
$object = MyClass::create();
// or fetch App\MyClass as a singleton
$singletonObject = MyClass::singleton();
```

this is much more convenient than the full Injector syntax:

```php
use App\MyClass;
use SilverStripe\Core\Injector\Injector;

// instantiate a new instance of App\MyClass via Injector
$object = Injector::inst()->create(MyClass::class);
// or fetch App\MyClass as a singleton
$singletonObject = Injector::inst()->get(MyClass::class);
```

this might look familar as it is the standard way to instantiate a `DataObject` (e.g `Page::create()`) and many other objects in Silverstripe CMS. Using this syntax rather than `new Page()` allows the object to be overridden by dependency injection.

## API documentation

- [Injector](api:SilverStripe\Core\Injector\Injector)
- [Factory](api:SilverStripe\Core\Injector\Factory)
