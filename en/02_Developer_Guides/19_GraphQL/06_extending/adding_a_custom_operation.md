---
title: Adding a custom operation
summary: Add a new operation for model types
---
# Extending the schema

[CHILDREN asList]

> [!NOTE]
> You are viewing docs for silverstripe/graphql 4.x.
> If you are using 3.x, documentation can be found
> [in the GitHub repository](https://github.com/silverstripe/silverstripe-graphql/tree/3)

## Adding a custom operation

By default, we get basic operations for our models, like `read`, `create`,
`update`, and `delete`, but we can add to this list by creating
an implementation of [`OperationProvider`](api:SilverStripe\GraphQL\Schema\Interfaces\OperationProvider) and registering it.

Let's build a new operation that **duplicates** DataObjects.

```php
namespace App\GraphQL;

use SilverStripe\GraphQL\Schema\Field\ModelMutation;
use SilverStripe\GraphQL\Schema\Interfaces\ModelOperation;
use SilverStripe\GraphQL\Schema\Interfaces\OperationCreator;
use SilverStripe\GraphQL\Schema\Interfaces\SchemaModelInterface;
use SilverStripe\GraphQL\Schema\SchemaConfig;

class DuplicateCreator implements OperationCreator
{
    public function createOperation(
        SchemaModelInterface $model,
        string $typeName,
        array $config = []
    ): ?ModelOperation {
        $mutationName = 'duplicate' . ucfirst(SchemaConfig::pluralise($typeName));

        return ModelMutation::create($model, $mutationName)
            ->setType($typeName)
            ->addArg('id', 'ID!')
            ->setDefaultResolver([static::class, 'resolve'])
            ->setResolverContext([
                'dataClass' => $model->getSourceClass(),
            ]);
    }
}
```

We add **resolver context** to the mutation because we need to know
what class to duplicate, but we need to make sure we still have a
static function.

The signature for resolvers with context is:

```php
namespace App\GraphQL\Resolvers;

use Closure;

class MyResolver
{
    public static function resolve(array $context): Closure
    {
        // ...
    }
}
```

We use the context to pass to a function that we'll create dynamically.
Let's add that now.

```php
namespace App\GraphQL;

use Closure;
// ...
use SilverStripe\ORM\DataObject;

class DuplicateCreator implements OperationCreator
{
    // ...

    public static function resolve(array $context = []): Closure
    {
        $dataClass = $context['dataClass'] ?? null;
        return function ($obj, array $args) use ($dataClass) {
            if (!$dataClass) {
                return null;
            }
            return DataObject::get_by_id($dataClass, $args['id'])
                ->duplicate();
        };
    }
}
```

Now, just add the operation to the `DataObjectModel` configuration
to make it available to all `DataObject` types.

```yml
# app/_graphql/config.yml
modelConfig:
  DataObject:
    operations:
      duplicate:
        class: 'App\GraphQL\DuplicateCreator'
```

And use it:

```yml
# app/_graphql/models.yml
App\Model\MyDataObject:
  fields: '*'
  operations:
    read: true
    duplicate: true
```

### Further reading

[CHILDREN]
