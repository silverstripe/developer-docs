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

The following snippet shows `Injector` creating a new object of type `App\MyClass` through its `create` method:

```php
use App\MyClass;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->create(MyClass::class);
```

Repeated calls to `create()` create a new object each time.

```php
use App\MyClass;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->create(MyClass::class);
$object2 = Injector::inst()->create(MyClass::class);

echo $object !== $object2;

// returns true;
```

### Singleton pattern

The `Injector` API can be used for the [singleton pattern](https://en.wikipedia.org/wiki/Singleton_pattern) through `get()`. Unlike `create()` subsequent calls to `get` return the same object instance as the first call.

```php
use App\MyClass;
use SilverStripe\Core\Injector\Injector;

// sets up MyClass as a singleton
$object = Injector::inst()->get(MyClass::class);
$object2 = Injector::inst()->get(MyClass::class);

echo ($object === $object2);

// returns true;
```

## Basic dependency injection

The benefit of constructing objects this way is that the object that the injector returns for `My ClassName` can be changed by subsequent code or configuration, for example:

```php
use App\MyClient;
use SilverStripe\Core\Injector\Injector;

// default client created - could be in core code
Injector::inst()->registerService(new ReadClient(), MyClient::class);
$client = Injector::inst()->get(MyClient::class);
// $client is an instance of ReadClient

// somewhere later, perhaps in some application code
Injector::inst()->registerService(new WriteClient(), MyClient::class);
$client = Injector::inst()->get(MyClient::class);
// $client is now an instance of WriteClient
```

> [!NOTE]
> Note that 'MyClient' [does not have to be an existing class](#service-inheritance) - you could use an abitrary string to identify it. That said using existing classes can be easier to reason about and can be refactored by automatic tools/IDEs.

Using Injector imperatively like this is most common [in testing](#testing-with-injector).

## Injector API 🤝 configuration API

The Injector API combined with the Configuration API is a powerful way to declare and manage dependencies in your code. For example, `MyClass` can be swapped out using the following config:

```yml
# app/_config/class-overrides.yml
SilverStripe\Core\Injector\Injector:
  App\MyClass:
    class: MyBetterClass
```

then used in PHP:

```php
use App\MyClass;
use SilverStripe\Core\Injector\Injector;

// sets up MyClass as a singleton
$object = Injector::inst()->get(MyClass::class);
// $object is an instance of MyBetterClass
```

This allows you to concisely override classes in Silverstripe core or other third-party Silverstripe code.

> [!NOTE]
> When overriding other configuration beware the [order that configuration is applied](../configuration/#configuration-values). You may have to use the [Before/After](../configuration/#before-after-priorities) syntax to apply your override.

### Special YAML syntax

You can use the special `%$` prefix in the configuration YAML to fetch items via the Injector. For example:

```yml
App\Services\MediumQueuedJobService:
    properties:
      queueRunner: '%$App\Tasks\Engines\MediumQueueAsyncRunner'
```

It is equivalent of calling `Injector::get()->instance(MediumQueueAsyncRunner::class)` and assigning the result to the `MediumQueuedJobService::queueRunner` property. This can be useful as these properties can easily updated if provided in a module or be changed for unit testing. It can also be used to provide constructor arguments such as [this example from the assets module](https://github.com/silverstripe/silverstripe-assets/blob/1/_config/asset.yml):

```yml
SilverStripe\Core\Injector\Injector:
  # Define the secondary adapter for protected assets
  SilverStripe\Assets\Flysystem\ProtectedAdapter:
    class: SilverStripe\Assets\Flysystem\ProtectedAssetAdapter
  # Define the secondary filesystem for protected assets
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

## Dependencies

Silverstripe classes can declare a special `$dependencies` array which can quickly configure dependencies when used with Injector. Injector will instantiate an object for every array value and assign it to a property that matches the array key. For example:

```php
namespace App;

use SilverStripe\Control\Controller;
use ThirdParty\PermissionService;

class MyController extends Controller
{
    private string $permissions;

    // we declare the types for each of the properties on the object. Anything we pass in via the Injector API must
    // match these data types.
    private static $dependencies = [
        'permissions' => '%$' . PermissionService::class,
    ];

    // Setter methods matching the array keys in $dependencies will be automatically
    // used by the injector to pass those dependencies in on instantiation.
    public function setPermissions(PermissionService $service): static
    {
        $this->permissions = $service;
        return $this;
    }
}
```

> [!NOTE]
> Note that using public properties instead of setter methods is also supported, though setter methods are generally preferred for code quality reasons.

When creating a new instance of `App\Control\MyController` via Injector the permissions property will contain an instance of the `ThirdParty\PermissionService` that was resolved by Injector.

```php
use App\Control\MyController;
use SilverStripe\Core\Injector\Injector;
use ThirdParty\PermissionService;

$object = Injector::inst()->get(MyController::class);

echo ($object->permissions instanceof PermissionService);
// returns true;
```

We can then change or override any of those dependencies via the [Configuration YAML](../configuration) and Injector does the hard work of wiring it up.

```yml
# app/_config/services.yml
SilverStripe\Core\Injector\Injector:
  ThirdParty\PermissionService:
    class: App\MyCustomPermissionService
```

Now the dependencies will be replaced with our configuration.

```php
use App\Control\MyController;
use App\MyCustomPermissionService;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->get(MyController::class);

// prints true
echo ($object->permissions instanceof MyCustomPermissionService);
```

### Properties

Injector's configuration can also be used to define properties, for example:

```yml
SilverStripe\Core\Injector\Injector:
  App\Control\MyController:
    properties:
      textProperty: 'My Text Value'
```

```php
use App\Control\MyController;

$object = Injector::inst()->get(MyController::class);

echo (is_string($object->textProperty));
// returns true;
```

### Dependent calls

As well as properties, method calls the class depends on can also be specified via the `calls` property in YAML:

```yml
SilverStripe\Core\Injector\Injector:
  App\Logger:
    class: Monolog\Logger
    calls:
      - [pushHandler, ['%$App\Log\DefaultHandler']]
```

This configuration will mean that every time `App\Logger` is instantiated by injector the `pushHandler` method will be called with the arguments `[ %$App\Log\DefaultHandler ]` (`%$App\Log\DefaultHandler` will be resolved by injector first). Note that [configuration is merged](../configuration/#configuration-values) so there may be multiple calls to `pushHandler` from other configuration files.

### Managed objects

Simple dependencies can be specified by the `$dependencies`, but more complex configurations are possible by specifying
constructor arguments, or by specifying more complex properties such as lists.

These more complex configurations are defined in `Injector` configuration blocks and are read by the `Injector` at
runtime.

Assuming a class structure such as

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
      0: 'dbusername'
      1: 'dbpassword'
```

Calling..

```php
use App\Control\MyController;
use SilverStripe\Core\Injector\Injector;

// sets up MyController as a singleton
$controller = Injector::inst()->get(MyController::class);
```

Would setup the following

- Create an object of type `App\Control\MyController`
- Look through the **dependencies** and call `get('PermissionService')`
- Load the configuration for PermissionService, and create an object of type `App\Control\RestrictivePermissionService`
- Look at the properties to be injected and look for the config for `App\ORM\MySQLDatabase`
- Create a `App\ORM\MySQLDatabase` class, passing `dbusername` and `dbpassword` as the parameters to the constructor.

## Factories

Some services require non-trivial construction which means they must be created
by a factory.

### Factory interface

Create a factory class which implements the [Factory](api:SilverStripe\Framework\Injector\Factory)
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

class MyFactory implements SilverStripe\Core\Injector\Factory
{
    public function create($service, array $params = [])
    {
        return new MyServiceImplementation();
    }
}
```

```php
use App\MyService;
use SilverStripe\Core\Injector\Injector;

// Will use App\MyFactoryImplementation::create() to create the service instance.
$instance = Injector::inst()->get(MyService::class);
```

### Factory method

To use any class that does not implement the Factory interface as a service factory
specify `factory` and `factory_method` keys.

An example of HTTP Client service with extra logging middleware:

```yml
# app/_config/services.yml
SilverStripe\Core\Injector\Injector:
  App\LogMiddleware:
    factory: 'GuzzleHttp\Middleware'
    factory_method: 'log'
    constructor: ['%$Psr\Log\LoggerInterface', '%$GuzzleHttp\MessageFormatter', 'info']
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

`Injector::inst()->get(GZIPJSONProvider::class)` will then be an instance of `App\JSONServiceImplementor` with the injected
properties.

It is important here to note that the 'class' property of the parent service will be inherited directly as well.
If class is not specified, then the class will be inherited from the outer service name, not the inner service name.

For example with this config:

```yml
SilverStripe\Core\Injector\Injector:
  App\Connector:
    properties:
      AsString: true
  App\ServiceConnector: '%$Connector'
```

Both `App\Connector` and `App\ServiceConnector` will have the `AsString` property set to true, but the resulting
instances will be classes which match their respective service names, due to the lack of a `class` specification.

## Testing with injector

In situations where injector states must be temporarily overridden, it is possible to create nested Injector instances
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

The `SilverStripe\Core\Injector\Injectable` trait can be used to indicate your class is able to be used with Injector (though it is not required). It also provides the `create` and `singleton` methods to shortcut creating objects through Injector.

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

$object = MyClass::create();
// or for a singleton
$singletonObject = MyClass::singleton();
```

this is much shorter than the full Injector syntax:

```php
use App\MyClass;
use SilverStripe\Core\Injector\Injector;

$object = Injector::inst()->create(MyClass::class);
// or for a singleton
$singletonObject = Injector::inst()->get(MyClass::class);
```

this might look familar as it is the standard way to instantiate a dataobject eg `Page::create()`. Using this syntax rather than `new Page()` allows the object to be overridden by dependency injection.

## API documentation

- [Injector](api:SilverStripe\Core\Injector\Injector)
- [Factory](api:SilverStripe\Core\Injector\Factory)
