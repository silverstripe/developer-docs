---
title: The global schema
summary: How to push modifications to every schema in the project
---

# Extending the schema

[CHILDREN asList]

> [!NOTE]
> You are viewing docs for silverstripe/graphql 4.x.
> If you are using 3.x, documentation can be found
> [in the GitHub repository](https://github.com/silverstripe/silverstripe-graphql/tree/3)

## The global schema

Developers of thirdparty modules that influence GraphQL schemas may want to take advantage
of the *global schema*. This is a pseudo-schema that will merge itself with all other schemas
that have been defined. A good use case is in the `silverstripe/versioned` module, where it
is critical that all schemas can leverage its schema modifications.

The global schema is named `*`.

```yml
# app/_config/graphql.yml
SilverStripe\GraphQL\Schema\Schema:
  schemas:
    '*':
      enums:
        VersionedStage:
          DRAFT: DRAFT
          LIVE: LIVE
```

### Further reading

[CHILDREN]
