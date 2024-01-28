---
title: PHP coding conventions
summary: The code style guidelines we use in our open source software
iconBrand: php
---

# PHP coding conventions

This document provides guidelines for code formatting and documentation to developers contributing to Silverstripe CMS [core and supported modules](/project_governance/supported_modules/).

These conventions will work well in most situations, though sometimes you may need to not follow them for practical reasons.

These coding conventions are for new code, and for situations where you are intentionally refactoring code for the purpose of improving coding standards (usually as part of a major release). Existing Silverstripe CMS code is inconsistent as to whether or not it follows these conventions.

## General

- Aim for compliance with the [PSR-12 coding standards](https://www.php-fig.org/psr/psr-12/).
- Prioritise the human readability of code over "clever" code that reduces the number of lines at the expense of readability.
- All symbols and documentation should use UK-English spelling, for example "behaviour" instead of "behavior" except when necessitated by third party conventions, for example using PHP's `Serializable` interface.
- Avoid writing HTML in PHP code. Instead, put HTML in template files.

## Naming conventions

### Casing

- Follow [PSR-1](https://www.php-fig.org/psr/psr-1/#1-overview) for naming class names, method names, and class constants
- Use [snake_case](https://en.wikipedia.org/wiki/Snake_case) for configuration properties (i.e. any `private static` properties not annotated with `@internal`)
- Use [camelCase](https://en.wikipedia.org/wiki/Camel_case) for all other class properties

### Accessors

- Prefix with `get` for getter methods and `set` for setter methods, for example `getValue()` and `setValue()`.

### Class name suffixes and prefixes

Use an appropriate suffix or prefix for classnames when making a subclass or implementing an interface. Usually the suffix will be the name of the parent class or the interface. Sometimes the suffix/prefix is a shortened version of the name of the parent because it reads better while retaining easy comprehension. Here are some common examples with the parent class or interface in brackets:

- `Admin` ([`ModelAdmin`](api:SilverStripe\Admin\ModelAdmin), [`LeftAndMain`]((api:SilverStripe\Admin\LeftAndAdmin)) if included in the CMS Menu)
- `Block` ([`BaseElement`](api:DNADesign\Elemental\Models\BaseElement))
- `DB` ([`DBField`](api:SilverStripe\ORM\FieldType\DBField)) - use as a prefix, e.g. `DBString`
- `Controller` ([`Controller`](api:SilverStripe\Control\Controller))
- `Exception` ([`Exception`](https://www.php.net/manual/en/class.exception.php))
- `Extension` ([`Extension`](api:SilverStripe\Core\Extension))
- `Factory` ([`Factory`](api:SilverStripe\Core\Injector\Factory))
- `Filter` ([`SearchFilter`](api:SilverStripe\ORM\Filters\SearchFilter))
- `Form` ([`Form`](api:SilverStripe\Forms\Form))
- `Field` ([`FormField`](api:SilverStripe\Forms\FormField))
- `Handler` ([`RequestHandler`](api:SilverStripe\Control\RequestHandler))
- `Page` ([`SiteTree`](api:SilverStripe\CMS\Model\SiteTree))
- `Job` ([`AbstractQueuedJob`](api:Symbiote\QueuedJobs\Services\AbstractQueuedJob))
- `Middleware` ([`HTTPMiddleware`](api:SilverStripe\Control\Middleware\HTTPMiddleware))
- `Task` ([`BuildTask`](api:SilverStripe\Dev\BuildTask))

## Directory naming - src dir

- Follow the [PSR-4 coding standard](https://www.php-fig.org/psr/psr-4/)
- Use initial caps pluralised for the directory naming. For example, use `Controllers` rather than `Controller` or `controllers`
- Put similar types of classes in the same directory. For example, put Controllers in a `Controllers` directory
- Put `DataObject` subclasses in a directory called `Models`
- If you end up with a lot of classes of a specific type with some clear grouping then you can use subdirectories to group them. For example use `src/Models/Sports` if you have a lot of sports related models.

## Properties and accessors

- For setter methods use a combination of a `static` return type and `return $this` to allow for fluent programming.
- Do not use [dynamic properties](https://www.php.net/manual/en/language.oop5.properties.php#language.oop5.properties.dynamic-properties)

## Method, property, and constant visibility

- Avoid `public` properties, instead use a combination of `private` (or `protected`) properties and `public` getter and setter methods.
- Prefer `private` over `protected` for all new properties. Subclasses can access the properties through the public getter and setter methods.
- Prefer `private` over `protected` for new methods, unless:
  - There is a clear use case for customising the specific functionality of that method on its own and the method implementation is unlikely to change in the near future
  - The method is intended to be called by subclasses.
- Use `public` for constants that should be accessed outside the class hierarchy,
- Prefer `private` over `protected` for non-public constants, unless they are intended to be used in subclasses.
- If someone requests a `private` method, property, or constant be made `protected` so that they can use it in their project or module code, that change should be made unless there's a really good reason not to.

## Interfaces

- Create an interface for type hinting if there are (or are likely to be in the future) multiple classes implementing a specific feature. Use the interface for type hints (for example for parameters, properties, and return types), and as the service key for injector.
- If there is only a single implementation and no foreseeable expectation of more implementations being added, then do not create an interface for the single class implementation because this would only be adding unnecessary complexity.

## Typing

- Strongly type all new properties, method parameters, and method return types. This includes files where there is no existing strong typing.
- Only provide docblock types for strongly typed parameters or return values if more context is provided.

## Mixed types

- Avoid using mixed types, including type unions, because this leads to complicated and brittle code.
- Avoid using nullable scalars and instead use the default value of the scalar instead of null. One exception to this is for when `null` means 'uninitialised'.
- Avoid using `func_get_args()`.

## Object instantiation

- For classes with the [`Injectable`](api:SilverStripe\Core\Injector\Injectable) trait, use the injector to instantiate objects using the `create()` static method rather than the `new` keyword.
- For classes without the [`Injectable`](api:SilverStripe\Core\Injector\Injectable) trait, either add the `Injectable` trait to the class or use the `new` keyword to instantiate it.
- For third-party classes, [use `Injector` directly](/developer_guides/extending/injector/#basic-usage) to instantiate objects rather than the `new` keyword.
- For unit tests, always use the `new` keyword when instantiating objects unless you are explicitly testing the injector logic.

## Extensions and traits

- Use the [`Extension`](api:SilverStripe\Core\Extension) class for extending classes, including `DataObject` subclasses.
- Do not use the `DataExtension` class, it will be deprecated in a future release.

Use a trait instead of an [`Extension`](api:SilverStripe\Core\Extension) when the composable functionality:

- Relies on per-instance properties, because they cannot be used with extensions
- Does not add or modify configuration properties or values
- Is not expected to be applied to third-party code.

Use an [`Extension`](api:SilverStripe\Core\Extension) instead of a trait when the composable functionality:

- Does not rely on per-instance properties
- Adds or modifies configuration properties or values
- Could be expected to be applied to third-party code.

### Extension hooks

- For hooks that update the value that's returned, name the hook `update{MethodName}` where `MethodName` has any prefix `get` removed. For example `getMyValue()` would have an extension hook named `updateMyValue()`.
- For hook that update a variable in the middle of a method, name the hook `update{Variable}` where `Variable` is the name of the variable being updated. For example if a method has a variable called `$myValue` then the hook would be named `updateMyValue()`.
- For hooks that update method parameters before running the body of the method, name the hook `onBefore{MethodName}`. For instance if a method is called `processSomething()` call the hook `onBeforeProcessSomething()`.
- If the method has an `onBefore` hook and also has a hook at the end of the method, then second hook should be called `onAfter{MethodName}`.

## Class member ordering

Order code in classes in the following order:

- Class constants
- Configuration properties (i.e. private static properties that don't have the `@internal` annotation)
- Static properties
- Member properties
- Static methods
- Controller action methods
- Commonly used methods like `getCMSFields()`
- Accessor methods (`getMyField()` and `setMyField()`)
- Template data-access methods (methods that will be called by a `$MethodName` or `<% loop $MethodName %>` construct in a template somewhere)
- Object methods

## Inline comments

- If there is a non-obvious reason for a code operation, include inline comments that explain *why* we are doing this operation. Remember that while something may be obvious to you now, it will not be obvious to someone else in 6 months.
- Self explanatory code with well-named methods and variables is preferred to inline comments that explain *what* the code does, though it's still OK to include these sorts of comments if you think it makes the code easier to follow.

### Unit testing

- Unit test method names should match the method that they're testing with the first letter of the method uppercased and the word `test` prefixed (for example for the method `myMethodName()` the unit test method should be called `testMyMethodName()`).
- Use the `@dataProvider` annotation to provide test case data when you are testing the same method in multiple scenarios. It makes code much cleaner and it makes it very easy to add further test cases.
- Data provider method names should be same as the test case method name they're providing for with the leading work `test` substituted for `provide` (for example for `testSomething()` the DataProvider is `provideSomething()`).
- Data provider array keys should describe the scenario they're testing.
- Unless you need to explicitly create dynamic fixtures, fixtures should be added via YAML fixture files.
- It's usually OK to use reflection to change the visibility of a private or protected method so that it can be tested independently. It is generally preferable to keep a smaller public API surface and use reflection to test functionality, rather than making the API public just so it can be tested.

## Raw SQL

- Avoid writing raw SQL and instead use ORM methods.
- If you do write raw SQL, use double quotes around table/column names and use parameterised queries, for example `->where(['"Score" > ?' => 50])`.
- Use [ANSI SQL](https://en.wikipedia.org/wiki/SQL#Standardization) format.

## PHPDoc

PHPDocs are not only useful when looking at the source code, but are also used in the API documentation at <https://api.silverstripe.org>.

- All [public API](/project_governance/public_api) should have a PHPDoc to describe its purpose, unless the API name and signature describe everything about its usage and purposes without any additional context.
- All `DataObject` and `Extension` subclasses must have `@method` annotations in their PHPDoc for relations (`has_one`, `has_many`, etc).
  - Do not add the annotation if a real method is declared with the same name.
  - Include the relevant `use` statements for all classes mentioned in the annotation
  - Return types should include generics, e.g. `@method HasManyList<Member> Members()`

## Other conventions

- Prefer the identical `===` operator over the equality `==` operator for comparisons.
- If you directly reference a third-party dependency in code, then ensure the dependency is required in the module's `composer.json` file.
- Avoid hardcoding values when there is a method available to dynamically get a value, for example use [`DataObjectSchema::tableName()`](api:SilverStripe\ORM\DataObjectSchema::tableName()) to get the table name for a `DataObject` model rather than hard coding it.
