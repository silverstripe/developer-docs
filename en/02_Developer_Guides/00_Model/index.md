---
title: Model and Databases
summary: Learn how Silverstripe CMS manages database tables, ways to query your database and how to publish data.
introduction: This guide will cover how to create and manipulate data within Silverstripe CMS and how to use the ORM (Object Relational Model) to query data.
icon: database
---

In Silverstripe CMS, application data will be represented by a [DataObject](api:SilverStripe\ORM\DataObject) class. A `DataObject` subclass defines the
data columns, relationships and properties of a particular data record. For example, [Member](api:SilverStripe\Security\Member) is a `DataObject` 
which stores information about a person, CMS user or mail subscriber.

[CHILDREN Exclude="How_tos"]

## How to's

[CHILDREN Folder="How_Tos"]
