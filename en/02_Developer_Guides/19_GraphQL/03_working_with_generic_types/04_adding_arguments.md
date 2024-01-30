---
title: Adding arguments
summary: Add arguments to your fields, queries, and mutations
---

# Working with generic types

[CHILDREN asList]

## Adding arguments

Fields can have arguments, and queries are just fields, so let's add a simple
way of influencing our query response:

```yml
# app/_graphql/schema.yml
queries:
  'readCountries(limit: Int!)': '[Country]'
```

> [!TIP]
> In the above example, the `limit` argument is *required* by making it non-nullable. If you want to be able
> to get an un-filtered list, you can instead allow the argument to be nullable by removing the `!`:
> `'readCountries(limit: Int)': '[Country]'`

We've provided the required argument `limit` to the query, which will allow us to truncate the results.
Let's update the resolver accordingly.

```php
namespace App\GraphQL\Resolver;

use SilverStripe\Core\Injector\Injector;
use SilverStripe\i18n\Data\Locales;

class MyResolver
{
    public static function resolveReadCountries($obj, array $args = [])
    {
        $limit = $args['limit'];
        $results = [];
        $countries = Injector::inst()->get(Locales::class)->getCountries();
        $countries = array_slice($countries, 0, $limit);

        foreach ($countries as $code => $name) {
            $results[] = [
                'code' => $code,
                'name' => $name,
            ];
        }

        return $results;
    }
}
```

Now let's try our query again. This time, notice that the IDE is telling us we're missing a required argument.
We need to add the argument to our query:

```graphql
query {
  readCountries(limit: 5) {
    name
    code
  }
}
```

This works pretty well, but maybe it's a bit over the top to *require* the `limit` argument. We want to optimise
performance, but we also don't want to burden the developer with tedium like this. Let's give it a default value.

```yml
# app/_graphql/schema.yml
queries:
  'readCountries(limit: Int = 20)': '[Country]'
```

Rebuild the schema and try the query again without adding a limit in the query. Notice that the IDE is no longer
yelling at you for a `limit` argument, but the result list is limited to the first 20 items.

Let's take this a step further by turning this in to a proper [paginated result](adding_pagination).

### Further reading

[CHILDREN]
