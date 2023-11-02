---
title: URL Variable tools
summary: Useful debugging tools you can use right in the browser
---
# URL variable tools

## Introduction

This page lists a number of "page options" , "rendering tools" or "special URL variables" that you can use to debug your
Silverstripe CMS applications.  These are consumed in PHP using the $_REQUEST or $_GET superglobals throughout the
Silverstripe CMS core.

## Debug toolbar

The easiest way to debug Silverstripe CMS is through the
[lekoala/silverstripe-debugbar](https://github.com/lekoala/silverstripe-debugbar) module.
It similar to the browser "developer toolbar", and adds itself to the bottom of the screen
when your site is in development mode. It shows you render times, database queries,
session variables, used templates and much more.

## Templates

 | URL Variable | Values | Description |
 | ------------ | ------ | ----------- |
 | flush        | 1      | Clears out all caches. Used mainly during development, e.g. when adding new classes or templates. Requires "dev" mode or ADMIN login |
 | showtemplate | 1      | Show the compiled version of all the templates used, including line numbers.  Good when you have a syntax error in a template. Cannot be used on a Live site without **isDev**. |

## General testing

 | URL Variable  | Values | Description |
 | ------------  | ------ | ----------- |
 | isDev         | 1      | Put the site into [development mode](../), enabling debugging messages to the browser on a live server.  For security, you'll be asked to log in with an administrator log-in. Will persist for the current browser session. |
 | isTest        | 1      | See above. |
 | debug         | 1      | Show a collection of debugging information about the director / controller operation        |
 | debug_request | 1      | Show all steps of the request from initial [HTTPRequest](api:SilverStripe\Control\HTTPRequest) to [Controller](api:SilverStripe\Control\Controller) to Template Rendering  |
 | execmetric    | 1      | Display the execution time and peak memory usage for the request |

## Classes and objects

 | URL Variable    | Values | Description |
 | ------------    | ------ | ----------- |
 | debugfailover   | 1      | Shows failover methods from classes extended |

## Database

 | URL Variable | Values             | Description |
 | ------------ | ------------------ | ----------- |
 | showqueries  | 1 &vert; inline    | List all SQL queries executed, the `inline` option will do a fudge replacement of parameterised queries |
 | showqueries  | 1 &vert; backtrace | List all SQL queries executed, the `backtrace` option will do a fudge replacement of parameterised queries *and* show a backtrace of every query |
 | previewwrite | 1                  | List all insert / update SQL queries, and **don't** execute them.  Useful for previewing writes to the database. |

## Security redirects

You can set an URL to redirect back to after a [Security](/developer_guides/security) action.  See the section on [URL
Redirections](/developer_guides/controllers/redirection) for more information and examples.

 | URL Variable | Values | Description |
 | ------------ | ------ | ----------- |
 | BackURL      | URL    | Set to a relative URL string to use once Security Action is complete |

## Building and publishing URLs

 | Site URL                                      | Action |
 | --------------------------------------------- | ------ |
 | `https://localhost**/dev/build**`              | Rebuild the entire database and manifest, see below for additional URL Variables |
 | `https://localhost**/admin/pages/publishall/**`| Publish all pages on the site. Only works reliably on smaller sites. |

### /dev/build

 | URL Variable  | Values | Description |
 | ------------  | ------ | ----------- |
 | quiet         | 1      | Don't show messages during build |
 | dont_populate | 1      | Don't run **requireDefaultRecords()** on the models when building. This will build the table but not insert any records |

## Config diagnostic URLs

 | Site URL                                      | Action |
 | --------------------------------------------- | ------ |
 | `https://localhost**/dev/config**`             | Output a simplified representation properties in the `Config` manifest |
 | `https://localhost**/dev/config/audit**`       | Audit `Config` properties and display any with missing PHP definitions |
