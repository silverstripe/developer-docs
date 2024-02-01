---
title: Working with generic types
summary: Break away from the magic of DataObject models and build types and queries from scratch.
icon: clipboard
---

# Working with generic types

In this section of the documentation, we cover the fundamentals that are behind a lot of the magic that goes
into making `DataObject` types work. We'll create some types that are not based on DataObjects at all, and we'll
write some custom queries from the ground up.

This is useful for situations where your data doesn't come from a `DataObject`, or where you have very specific
requirements for your GraphQL API that don't easily map to the schema of your `DataObject` classes.

> [!NOTE]
> Just because we won't be using DataObjects in this example doesn't mean you can't do it - you can absolutely
> declare `DataObject` classes as generic types. You would lose a lot of the benefits of the `DataObject` model
> in doing so, but this lower level API may suit your needs for very specific use cases.

[CHILDREN]
