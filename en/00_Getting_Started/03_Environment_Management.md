---
title: Environment Management
summary: How to configure your server environment for Silverstripe CMS
---

# Environment management

As part of website development and hosting it is natural for our sites to be hosted on several different environments.
These can be our laptops for local development, a testing server for customers to test changes on, or a production
server.

For each of these environments we may require slightly different configurations for our servers. This could be our debug
level, caching backends, or - of course - sensitive information such as database credentials.

To manage environment variables, as well as other server globals, the [api:SilverStripe\Core\Environment] class provides
a set of APIs and helpers.

## Security considerations

Sensitive credentials should not be stored in a VCS or project code and should only be stored on the environment in
question. When using live environments the use of `.env` files is discouraged and instead one should use "first class"
environment variables.

If you do use a `.env` file on your servers, you must ensure that external access to `.env` files is blocked by the
webserver.

## Managing environment variables with .env files

By default a file named `.env` must be placed in your project root (ie: the same folder as your `composer.json`) or the
parent directory. If this file exists, it will be automatically loaded by the framework and the environment variables
will be set. An example `.env` file is included in the default installer named `.env.example`.

**Note:** The file must be named exactly `.env` and not any variation (such as `mysite.env` or `.env.mysite`) or it will
not be detected automatically. If you wish to load environment variables from a file with a different name, you will
need to do so manually. See the [Including an extra `.env` file](#including-an-extra-env-file) section below for more
information.

## Other ways to manage environment variables

Silverstripe CMS will respect environment variables provided by the server.

If you are using a docker compose setup, you can set environment variables in your `docker-compose.yml` file.
[See the docker compose docs for more information](https://docs.docker.com/compose/compose-file/#environment).

You can set environment variables using Apache. Please
[see the Apache docs for more information](https://httpd.apache.org/docs/current/env.html).

## How to access the environment variables

Accessing the environment variables should be done via the [`Environment::getEnv()`](api:SilverStripe\Core\Environment::getEnv()) method.

```php
use SilverStripe\Core\Environment;
Environment::getEnv('SS_DATABASE_CLASS');
```

[hint]
The `Environment::getEnv()` method will return `false` both if there was no value set for a variable or if
the variable was explicitly set as `false`. You can determine whether a variable has been set by calling
[`Environment::hasEnv()`](api:SilverStripe\Core\Environment::hasEnv()).
[/hint]

Individual settings can be assigned via [`Environment::setEnv()`](api:SilverStripe\Core\Environment::setEnv()) or [`Environment::putEnv()`](api:SilverStripe\Core\Environment::putEnv()) methods.

```php
use SilverStripe\Core\Environment;
Environment::setEnv('API_KEY', 'AABBCCDDEEFF012345');
```

[warning]
`Environment::getEnv()` will return `false` whether the variable was explicitly set as `false` or simply wasn't set at all. You can use [`Environment::hasEnv()`](api:SilverStripe\Core\Environment::hasEnv()) to check whether an environment variable was set or not.
[/warning]

### Using environment variables in config

To use environment variables in `.yaml` configs you can reference them using backticks. This only works in `Injector` configuration.
See the [Injector documentation](/developer_guides/extending/injector/#using-constants-and-environment-variables) for details.

## Including an extra .env file

Sometimes it may be useful to include an extra `.env` file - on a shared local development environment where all
database credentials could be the same. To do this, you can add this snippet to your `app/_config.php` file:

Note that by default variables cannot be overridden from this file; Existing values will be preferred over values in
this file.

```php
use SilverStripe\Core\EnvironmentLoader;
$env = BASE_PATH . '/app/.env';
$loader = new EnvironmentLoader();
$loader->loadFile($env);
```

[warning]
Note that because `_config.php` is processed after yaml configuration, variables set in these extra `.env` files cannot be used inside yaml config.
[/warning]

## Core environment variables

Silverstripe core environment variables are listed here, though you're free to define any you need for your application.

| Name  | Description |
| ----  | ----------- |
| `SS_DATABASE_CLASS` | The database class to use. Only `MySQLDatabase` is included by default, but other values are available in optional modules such as [`PostgreSQLDatabase`](https://github.com/silverstripe/silverstripe-postgresql). Defaults to `MySQLDatabase`.|
| `SS_DATABASE_SERVER`| The database server to use. Defaults to `localhost`.|
| `SS_DATABASE_USERNAME`| The database username (mandatory).|
| `SS_DATABASE_PASSWORD`| The database password (mandatory).|
| `SS_DATABASE_PORT`|     The database port.|
| `SS_DATABASE_SUFFIX`|   A suffix to add to the database name.|
| `SS_DATABASE_PREFIX`|   A prefix to add to the database name.|
| `SS_DATABASE_NAME` | The database name. If not set, `SS_DATABASE_CHOOSE_NAME` must be set instead. |
| `SS_DATABASE_CHOOSE_NAME`| Boolean/Int. If defined, then the system will choose a default database name for you. The database name will be "SS_" followed by the name of the folder into which you have installed Silverstripe.<br />If `SS_DATABASE_CHOOSE_NAME` is an integer greater than one, then an ancestor folder will be used for the  database name. This is handy for a site that's hosted from `/sites/examplesite/www` or `/buildbot/allmodules-2.3/build`. If it's `2`, the parent folder will be chosen; if it's `3` the grandparent, and so on.<br /><br />Ignored if `SS_DATABASE_NAME` is set.|
| `SS_DATABASE_SSL_KEY` | Absolute path to SSL key file (optional - but if set, `SS_DATABASE_SSL_CERT` must also be set) |
| `SS_DATABASE_SSL_CERT` | Absolute path to SSL certificate file (optional - but if set, `SS_DATABASE_SSL_KEY` must also be set) |
| `SS_DATABASE_SSL_CA` | Absolute path to SSL Certificate Authority bundle file (optional) |
| `SS_DATABASE_SSL_CIPHER` | Custom SSL cipher for database connections (optional) |
| `SS_DATABASE_TIMEZONE`| Set the database timezone to something other than the system timezone.
| `SS_DEPRECATION_ENABLED` | Enable deprecation notices for this environment. `SS_ENVIRONMENT_TYPE` must be set to `dev` for deprecation notices to show. See [Deprecations](/upgrading/deprecations/) for more information. |
| `SS_DEPRECATION_SHOW_HTTP` | Include deprecation warnings in HTTP responses if `SS_ENVIRONMENT_TYPE` is true. Defaults to false. |
| `SS_DEPRECATION_SHOW_CLI` | Include deprecation warnings in CLI responses if `SS_ENVIRONMENT_TYPE` is true. Defaults to true. |
| `SS_ENVIRONMENT_TYPE`| The environment type. Should be one of `dev`, `test`, or `live`. See [Environment Types](/debugging/environment_types/) for more information. |
| `SS_DEFAULT_ADMIN_USERNAME`| The username of the default admin. This is a user with administrative privileges. |
| `SS_DEFAULT_ADMIN_PASSWORD`| The password of the default admin. This will not be stored in the database. |
| `SS_USE_BASIC_AUTH`| Baseline protection for requests handled by Silverstripe. Usually requires additional security measures for comprehensive protection. Set this to the name of a permission which users must have to be able to access the site (e.g. "ADMIN"). See [Environment Types](/developer_guides/debugging/environment_types) for caveats. |
| `SS_SEND_ALL_EMAILS_TO`| If you define this constant all emails will be redirected to this address, overriding the original address(es). |
| `SS_SEND_ALL_EMAILS_FROM`| If you define this constant all emails will be sent from this address, overriding the original address. |
| `SS_ERROR_LOG` | Path to a file for logging errors, relative to the project root. See [Logging and Error Handling](/developer_guides/debugging/error_handling/) for more information about error logging. |
| `SS_PROTECTED_ASSETS_PATH` | Path to secured assets - defaults to `ASSETS_PATH/.protected`. See [Protected file paths](/developer_guides/files/file_storage/#protected-file-paths) for more information. |
| `SS_DATABASE_MEMORY` | Used for [SQLite3](https://github.com/silverstripe/silverstripe-sqlite3) database connectors. |
| `SS_TRUSTED_PROXY_IPS` | IP address or CIDR range to trust proxy headers from. If left blank no proxy headers are trusted. Can be set to 'none' (trust none) or '*' (trust all). See [Request hostname forgery](/developer_guides/security/secure_coding/#request-hostname-forgery) for more information. |
| `SS_ALLOWED_HOSTS` | A comma deliminated list of hostnames the site is allowed to respond to. See [Request hostname forgery](/developer_guides/security/secure_coding/#request-hostname-forgery) for more information. |
| `SS_MANIFESTCACHE` | The manifest cache to use (defaults to file based caching). Must be a `Psr\Cache\CacheItemPoolInterface`, `Psr\SimpleCache\CacheInterface`, or `SilverStripe\Core\Cache\CacheFactory` class implementation. |
| `SS_IGNORE_DOT_ENV` | If set, the `.env` file will be ignored. This is good for live to mitigate any performance implications of loading the `.env` file. |
| `SS_BASE_URL` | The url to use when it isn't determinable by other means (eg: for CLI commands). Should either start with a protocol (e.g. `https://www.example.com`) or with a double forward slash (e.g. `//www.example.com`). |
| `SS_FLUSH_ON_DEPLOY` | Try to detect deployments through file system modifications and flush on the first request after every deploy. Does not run "dev/build" - only "flush". Possible values are `true` (check for a framework PHP file modification time), `false` (no checks, skip deploy detection) or a path to a specific file or folder to be checked. See [DeployFlushDiscoverer](api:SilverStripe\Core\Startup\DeployFlushDiscoverer) for more details.<br /><br />False by default. |
| `SS_TEMP_PATH` | File storage used for the default cache adapters in [Manifests](/developer_guides/execution_pipeline/manifests), [Object Caching](/developer_guides/performance/caching) and [Partial Template Caching](/developer_guides/templates/partial_template_caching). Can be an absolute path (with a leading `/`), or a path relative to the project root. Defaults to creating a sub-directory of PHP's built-in `sys_get_temp_dir()` or using the `silverstripe-cache` directory relative to the project root if one is present. |
