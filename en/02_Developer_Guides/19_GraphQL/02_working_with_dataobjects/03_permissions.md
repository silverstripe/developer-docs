---
title: DataObject operation permissions
summary: A look at how permissions work for DataObject queries and mutations
---

# Working with `DataObject` models

[CHILDREN asList]

## `DataObject` operation permissions

Any of the operations that come pre-configured for DataObjects are secured by the appropriate permissions
by default.
Please see [Model-Level Permissions](/developer_guides/model/permissions/#model-level-permissions) for more information.

### Mutation permssions

> [!NOTE]
> When mutations fail due to permission checks, they throw a [`PermissionsException`](api:SilverStripe\GraphQL\Schema\Exception\PermissionsException).

For `create`, if a singleton instance of the record being created doesn't pass a `canCreate($member)` check,
the mutation will throw.

For `update`, if the record matching the given ID doesn't pass a `canEdit($member)` check, the mutation will
throw.

For `delete`, if any of the given IDs don't pass a `canDelete($member)` check, the mutation will throw.

### Query permissions

Query permissions are a bit more complicated, because they can either be in list form, (paginated or not),
or a single item. Rather than throw, these permission checks work as filters.

> [!WARNING]
> It is critical that you have a `canView()` method defined on your DataObjects. Without this, only admins are
> assumed to have permission to view a record.

For `read` and `readOne` a plugin called `canView` will filter the result set by the `canView($member)` check.

> [!WARNING]
> When paginated items fail a `canView()` check, the `pageInfo` field is not affected.
> Limits and pages are determined through database queries. It would be too inefficient to perform in-memory checks on large data sets.
> This can result in pages showing a smaller number of items than what the page should contain, but keeps the pagination calls consistent
> for `limit` and `offset` parameters.

### Disabling query permissions

Though not recommended, you can disable query permissions by setting their plugins to `false`.

```yml
# app/_graphql/models.yml
Page:
  operations:
    read:
      plugins:
        canView: false
    readOne:
      plugins:
        canView: false
```

### Further reading

[CHILDREN]
