---
title: Writing a simple plugin
summary: In this tutorial, we add a simple plugin for string fields
---

# Plugins

[CHILDREN asList]

## Writing a simple plugin

For this example, we want all `String` fields to have a `truncate` argument that will limit the length of the string
in the response.

Because it applies to fields, we'll want to implement the [`FieldPlugin`](api:SilverStripe\GraphQL\Schema\Interfaces\FieldPlugin)
interface for this.

```php
namespace App\GraphQL\Plugin;

use SilverStripe\GraphQL\Schema\Field\Field;
use SilverStripe\GraphQL\Schema\Interfaces\FieldPlugin;
use SilverStripe\GraphQL\Schema\Schema;

class Truncator implements FieldPlugin
{
    public function getIdentifier(): string
    {
        return 'truncate';
    }

    public function apply(Field $field, Schema $schema, array $config = [])
    {
        $field->addArg('truncate', 'Int');
    }
}
```

Now we've added an argument to any field that uses the `truncate` plugin. This is good, but it really
doesn't save us a whole lot of time. The real value here is that the field will automatically apply the truncation.

For that, we'll need to augment our plugin with some *afterware*.

```php
namespace App\GraphQL\Plugin;

use SilverStripe\GraphQL\Schema\Field\Field;
use SilverStripe\GraphQL\Schema\Interfaces\FieldPlugin;
use SilverStripe\GraphQL\Schema\Schema;

class Truncator implements FieldPlugin
{
    public function apply(Field $field, Schema $schema, array $config = [])
    {
        // Sanity check
        Schema::invariant(
            $field->getType() === 'String',
            'Field %s is not a string. Cannot truncate.',
            $field->getName()
        );

        $field->addArg('truncate', 'Int');
        $field->addResolverAfterware([static::class, 'truncate']);
    }

    public static function truncate(string $result, array $args): string
    {
        $limit = $args['truncate'] ?? null;
        if ($limit) {
            return substr($result, 0, $limit);
        }

        return $result;
    }
}
```

Let's register the plugin:

```yml
SilverStripe\Core\Injector\Injector:
  SilverStripe\GraphQL\Schema\Registry\PluginRegistry:
    constructor:
      - 'App\GraphQL\Plugin\Truncator'
```

And now we can apply it to any string field we want:

```yml
# app/_graphql/types.yml
Country:
  name:
    type: String
    plugins:
      truncate: true
```

### Further reading

[CHILDREN]
