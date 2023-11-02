---
title: Themes
summary: What makes up a Silverstripe CMS Theme. How to install one or write your own theme. 
icon: paint-brush
---

# Themes

Themes can be used to kick start your Silverstripe CMS projects, can be stored outside of your application code and your
application can provide multiple unique themes (i.e.a mobile theme).

## Downloading

Head to the [Packagist](https://packagist.org/search/?type=silverstripe-theme) to check out the range of themes the 
community has built. Themes are published and downloaded using Composer,
just like any other [Silverstripe module](/developer_guides/extending/modules).

## Installation

Themes can be installed through `composer`.

```bash
composer require my_vendor/my_theme [version]
```

*Note:* `[version]` should be replaced with a version constraint if you know it, otherwise leave it blank to pull the latest version compatible with your project.

[alert]
As you've added new files to your Silverstripe CMS installation, make sure you clear the Silverstripe CMS cache by appending
`?flush=1` to your website URL (e.g `https://www.example.com/?flush=1`).
[/alert]

### Configuring themes

After installing a new theme or manually adding one yourself, update the current theme in Silverstripe CMS. This can be done by
altering the `SSViewer.themes` setting in a [yaml configuration](../configuration).

**app/_config/app.yml**

```yaml
SilverStripe\View\SSViewer:
  themes:
    - '$public'
    - theme_name
    - '$default'
```

This configuration determines the priority order of themes for your project for template and resource resolution,
and can include as many themes as you like.

Silverstripe CMS has support for cascading themes, which will allow users to define multiple themes for a project. This means you can have a template or other resource defined in any theme, and reference or override it in another theme.

There are a variety of ways in which you can specify a theme. The below describe the three
main styles of syntax:

1. You can use the following to point to a theme or path within your root project:

  - Refer to the theme directly by name. A simple name with no slash represents a theme in the `themes/` directory (e.g. "mytheme" refers to the `themes/mytheme` theme).
  - `/some/path/to/theme` - Any string prefixed with `/` will be treated as a filesystem path to a theme root (relative to the project root).
  - `$themeset` - Any `$` prefixed name will refer to a set of themes. By default only the `$default` and `$public` sets are configured (see [special themesets](#special-themesets) below).

2. Using the `:` syntax you can also specify themes relative to the given module:

  - `myvendor/mymodule:sometheme` - This will specify a standard theme within the given module.
  This will lookup the theme in the `themes` subfolder within this module. E.g.
  `/vendor/myvendor/mymodule/themes/sometheme`.
  Note: This syntax also works without the vendor prefix (`mymodule:sometheme`)
  - `myvendor/mymodule:/some/path` - Rather than looking in the themes subdir, look in the
  exact path within the root of the given module.

3. You can also specify a module root folder directly. 

  - `myvendor/mymodule` - Points to the base folder of the given module.
  - `mymodule:` - Also points to the base folder of the given module, but without a vendor.
  The `:` is necessary to distinguish this from a non-module theme.

#### Special themesets

In the above configuration, `$public` and `$default` are special placeholders.

`$public` refers to the `public/` directory in your project, which effectively makes your `public/` directory a theme itself.
Any resources you put in that directory can be accessed the same way you access regular theme resources, such as via [the requirements API](requirements)
or the [`ThemeResourceLoader`](api:SilverStripe\View\ThemeResourceLoader).

[warning]
We recommend you don't include any templates in the public directory, as doing so could expose sensitive information such as information about your database schema.
[/warning]

`$default` refers to all modules which have a `template/` directory (including your project). Typically this goes at the end of the themes configuration,
so that your themes take precedence over any templates provided by modules.

## Developing your own theme

A `theme` within Silverstripe CMS is simply a collection of templates and other front end resources such as javascript and CSS located within the `themes/` directory.

![themes:basicfiles.gif](../../_images/basicfiles.gif)

To define extra themes simply add extra entries to the `SilverStripe\View\SSViewer.themes` configuration array. You will probably always want to ensure that you include `'$default'` in your list of themes to ensure that the base templates are used when required.

## Submitting your theme

If you want to submit your theme to Packagist for others to use, then check:

* You should ensure your templates are well structured, modular and commented so it's easy for other people to customise 
* Templates should not contain text inside images and all images provided must be open source and not break any 
copyright or license laws. This includes any icons your template uses.
* A theme does not include any PHP files. Only CSS, HTML, images and javascript.
* That your theme contains a `composer.json` file specifying the theme name, author and license, and that it has `"type": "silverstripe-theme"`.

Once you've created your module and set up your Composer configuration, create a new repository and push your theme to a Git host such as [GitHub.com](https://github.com). 

The final step is to [submit your theme to Packagist](https://packagist.org/about#how-to-submit-packages) (the central Composer package repository).

## Links

 * [Silverstripe CMS themes on Packagist](https://packagist.org/search/?type=silverstripe-theme)

## Related Lessons
* [Creating your first project](https://www.silverstripe.org/learn/lessons/v4/creating-your-first-project)
* [Migrating static templates into your theme](https://www.silverstripe.org/learn/lessons/v4/migrating-static-templates-into-your-theme-1)
