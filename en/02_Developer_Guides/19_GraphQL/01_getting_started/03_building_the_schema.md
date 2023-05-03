---
title: Building the schema
summary: Turn your schema configuration into executable code
icon: hammer
---

# Getting started

[CHILDREN asList]

## Building the schema

The primary API surface of the `silverstripe/graphql` module is the yaml configuration, along
with some [procedural configuration](using_procedural_code). It is important to understand
that **none of this configuration gets interpreted at runtime**. Loading the schema configuration
(which we refer to as the "schema definition") at runtime and converting it to executable code
has dire effects on performance, making API requests slower and slower as the schema grows larger.

To mitigate this problem, the schema that gets executed at runtime is **generated PHP code**.
This code generation happens during a build step, and it is critical to run this build step
whenever the schema definition changes, or a new schema definition is added.

### What triggers a GraphQL code build?

* Any time you run the `dev/graphql/build` command to explicitly build your GraphQL schemas.
* Any time you run the `dev/build` command on your project.
* `silverstripe/graphql` will attempt to generate your schema "on-demand" on the first GraphQL request _only_ if it wasn’t already generated.

[warning]
Relying on the "on-demand" schema generation on the first GraphQL request requires some additional consideration.
See [deploying the schema](deploying_the_schema#on-demand).
[/warning]

#### Running `dev/graphql/build`

The main command for generating the schema code is `dev/graphql/build`.

`vendor/bin/sake dev/graphql/build`

This command takes an optional `schema` parameter. If you only want to generate a specific schema
(e.g. generate your custom schema, but not the CMS schema), you should pass in the name of the
schema you want to build.

[info]
If you do not provide a `schema` parameter, the command will build all schemas.
[/info]

`vendor/bin/sake dev/graphql/build schema=default`

[info]
Most of the time, the name of your custom schema is `default`. If you're editing DataObjects
that are accessed with GraphQL in the CMS, you may have to rebuild the `admin` schema as well.
[/info]

Keep in mind that some of your changes will be in YAML in the `_config/` directory, which also
requires a flush.

`vendor/bin/sake dev/graphql/build schema=default flush=1`

#### Building on dev/build

By default, all schemas will be built during `dev/build`. To disable this, change the config:

```yaml
SilverStripe\GraphQL\Extensions\DevBuildExtension:
  enabled: false
```

### Caching

Generating code is a pretty expensive process. A large schema with 50 `DataObject` classes exposing
all their operations can take up to **20 seconds** to generate. This may be acceptable
for initial builds and deployments, but during incremental development this can really
slow things down.

To mitigate this, the generated code for each type is cached against a signature.
If the type hasn't changed, it doesn't get re-built. This reduces build times to **under one second** for incremental changes.

#### Choosing where the cache is stored {#cache-location}

By default, the generated PHP code is placed in the `.graphql-generated/` directory in the root of your project.

If you want to store this in another directory, you can configure this using the following yaml configuration. Note that the path is relative to your project root.

```yml
SilverStripe\GraphQL\Schema\Storage\CodeGenerationStore:
  dirName: 'some/other/directory'
```

If you set the `dirName` configuration property to be blank, the schema will be stored in the `silverstripe-cache` (i.e. `TEMP_PATH`) directory. This can be useful
if you have a mechanism that clear this folder on each deployment, or if you share this folder between servers in a multi-server setup, etc.

```yml
SilverStripe\GraphQL\Schema\Storage\CodeGenerationStore:
  dirName: ''
```

[notice]
Your schema will not be cleared on a normal system `flush`, even if you store it in the `silverstripe-cache` directory. See below to learn how to clear the schema.
[/notice]

#### Clearing the schema cache

If you want to completely re-generate your schema from scratch, you can add `clear=1` to the `dev/graphql/build` command.

`vendor/bin/sake dev/graphql/build schema=default clear=1`

If your schema is producing unexpected results, try using `clear=1` to eliminate the possibility
of a caching issue. If the issue is resolved, record exactly what you changed and [create an issue](https://github.com/silverstripe/silverstripe-graphql/issues/new).

### Build gotchas

Keep in mind that it's not always explicit schema definition changes that require a build.
Anything influencing the output of the schema will require a build. This could include
tangential changes such as:

* Updating the `$db` array (or relationships) of a `DataObject` class that has `fields: '*'` (i.e. include all fields on that class in the schema).
* Adding a new resolver for a type that uses [resolver discovery](../working_with_generic_types/resolver_discovery)
* Adding an extension to a `DataObject` class
* Adding a new subclass of a `DataObject` class that is already exposed

### Viewing the generated code

If you want to view your generated code, you can find it in the directory it has been configured to build in. See [choosing where the cache is stored](#cache-location) above.
It is not meant to be accessible through your webserver, which is ensured by keeping it outside of the
`public/` webroot and the inclusion of a `.htaccess` file in each schema folder.

Additional files are generated for CMS operation in `public/_graphql/`, and
those _are_ meant to be accessible through your webserver.
See [Tips and Tricks: Schema Introspection](tips_and_tricks#schema-introspection)
to find out how to generate these files for your own schema.

[alert]
While it is safe for you to view these files, you should not manually alter them. If you need to make a change
to your GraphQL schema, you should [update the schema definition](configuring_your_schema) and rebuild your schema.
[/alert]

### Further reading

[CHILDREN]
