---
title: SQL Placeholders
summary: SQL placeholders in ORM queries
icon: tachometer-alt
---

# SQL Placeholders

SQL placeholders are `?` characters used as a placeholder for a value in a SQL query as a way to prevent SQL injection attacks. They are used by default extensively in queries created by the ORM.

For increased performance, placeholders are not used when filtering by an array of integer only values on a column that is either a [`DBPrimarykey`](api:SilverStripe\ORM\FieldType\DBPrimaryKey) or a [`DBForiegnKey`](api:SilverStripe\ORM\FieldType\DBForiegnKey). An example of this type of ORM filter is `->filter(['ID' => $ids])` which will turn into a SQL containing `WHERE IN (<ids>)`. 

There is no chance of SQL injection because of the exclusive use of integers for values. However, if you still wish for placeholders to be used for this type of query then you can enable them with the following config:

```yml
SilverStripe\ORM\Filters\ExactMatchFilter:
  use_placeholders_for_integer_ids: true
```
