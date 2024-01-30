---
title: Enums, unions, and interfaces
summary: Add some non-object types to your schema
---
# Working with generic types

[CHILDREN asList]

> [!NOTE]
> You are viewing docs for silverstripe/graphql 4.x.
> If you are using 3.x, documentation can be found
> [in the GitHub repository](https://github.com/silverstripe/silverstripe-graphql/tree/3)

## Enums, unions, and interfaces

In more complex schemas, you may want to define types that aren't simply a list of fields, or
"object types." These include enums, unions and interfaces.

### Enum types

Enum types are simply a list of string values that are possible for a given field. They are
often used in arguments to queries, such as `{sort: DESC}`.

It's very easy to add enum types to your schema. Just use the `enums` section of the config.

```yml
# app/_graphql/schema.yml
enums:
  SortDirection:
    values:
      DESC: Descending order
      ASC: Ascending order
```

### Interfaces

An interface is a specification of fields that must be included on a type that implements it.
For example, an interface `Person` could include `firstName: String`, `surname: String`, and
`age: Int`. The types `Actor` and `Chef` would implement the `Person` interface, and therefore
querying for `Person` types can also give you `Actor` and `Chef` types in the result. Actors and
chefs must also have the `firstName`, `surname`, and `age` fields for such a query to work.

To define an interface, use the `interfaces` section of the config.

```yml
# app/_graphql/schema.yml
interfaces:
  Person:
    fields:
      firstName: String!
      surname: String!
      age: Int!
    resolveType: [ 'App\GraphQL\Resolver\MyResolver', 'resolvePersonType' ]
```

Interfaces must define a `resolve[Typename]Type` resolver method to inform the interface
which type it is applied to given a specific result. This method is non-discoverable and
must be applied explicitly.

```php
namespace App\GraphQL\Resolver;

use App\Model\Actor;
use App\Model\Chef;

class MyResolver
{
    public static function resolvePersonType($object): string
    {
        if ($object instanceof Actor) {
            return 'Actor';
        }
        if ($object instanceof Chef) {
            return 'Chef';
        }
    }
}
```

### Union types

A union type is used when a field can resolve to multiple types. For example, a query
for "Articles" could return a list containing both "Blog" and "NewsStory" types.

To add a union type, use the `unions` section of the configuration.

```yml
# app/_graphql/schema.yml
unions:
  Article:
    types: [ 'Blog', 'NewsStory' ]
    typeResolver: [ 'App\GraphQL\Resolver\MyResolver', 'resolveArticleUnion' ]
```

Like interfaces, unions need to know how to resolve their types. These methods are also
non-discoverable and must be applied explicitly.

```php
namespace App\GraphQL\Resolver;

use App\Model\Article;

class MyResolver
{
    public static function resolveArticleUnion(Article $object): string
    {
        if ($object->category === 'blogs') {
            return 'Blog';
        }
        if ($object->category === 'news') {
            return 'NewsStory';
        }
    }
}
```

### Further reading

[CHILDREN]
