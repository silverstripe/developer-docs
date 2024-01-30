---
title: Nested type definitions
summary: Define dependent types inline with a parent type
---
# Working with `DataObject` models

[CHILDREN asList]

> [!NOTE]
> You are viewing docs for silverstripe/graphql 4.x.
> If you are using 3.x, documentation can be found
> [in the GitHub repository](https://github.com/silverstripe/silverstripe-graphql/tree/3)

## Nested type definitions

For readability and ergonomics, you can take advantage of nested type definitions. Let's imagine
we have a `Blog` and we want to expose `Author` and `Categories`, but while we're at it, we want
to specify what fields they should have.

```yml
# app/_graphql/models.yml
App\PageType\Blog:
  fields:
    title: true
    author:
      fields:
        firstName: true
        surname: true
        email: true
    categories:
      fields: '*'
```

Alternatively, we could flatten that out:

```yml
# app/_graphql/models.yml
App\PageType\Blog:
  fields:
    title: true
    author: true
    categories: true
SilverStripe\Security\Member:
  fields:
    firstName: true
    surname: true
    email: true
App\Model\BlogCategory:
  fields: '*'
```

> [!NOTE]
> You cannot define operations on nested types. They only accept fields.

### Further reading

[CHILDREN]
