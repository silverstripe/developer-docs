---
title: Recursive or complex queries
summary: Protecting against potentially malicious queries
---

# Security & best practices

[CHILDREN asList]

## Recursive or complex queries

GraphQL schemas can contain recursive types and circular dependencies. Recursive or overly complex queries can take up a lot of resources,
and could have a high impact on server performance and even result in a denial of service if not handled carefully.

Before parsing queries, if a query is found to have more than 500 nodes, it is rejected. While executing queries there is a default query depth limit of 15 for all schemas with no complexity limit.

You can customise the node limit and query depth and complexity limits by setting the following configuration:

**app/_config/graphql.yml**

```yaml
---
After: 'graphql-schema-global'
---
SilverStripe\GraphQL\Schema\Schema:
  schemas:
    '*':
      config:
        max_query_nodes: 250 # default 500
        max_query_depth: 20 # default 15
        max_query_complexity: 100 # default unlimited
```

[info]
For calculating the query complexity, every field in the query gets a default score 1 (including ObjectType nodes). Total complexity of the query is the sum of all field scores.
[/info]

You can also configure these settings for individual schemas. This allows you to fine-tune the security of your custom public-facing schema without affecting the security of the schema used in the CMS. To do so, either replace `'*'` with the name of your schema in the yaml configuration above, or set the values under the `config` key for your schema using preferred file structure as defined in [configuring your schema](../getting_started/configuring_your_schema/). For example:

**app/_graphql/config.yml**

```yaml
max_query_nodes: 250
max_query_depth: 20
max_query_complexity: 100
```

### Further reading

[CHILDREN]
