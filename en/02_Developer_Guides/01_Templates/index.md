---
title: Templates and Views
summary: This guide showcases the Silverstripe CMS template engine and learn how to build your own themes.
introduction: Silverstripe CMS comes with it's own templating engine. This guide walks you through the features of the template engine, how to create custom templates and ways to customise your data output.
icon: file-code
---

Most of what will be public on your website comes from template files that are defined in Silverstripe CMS. Either in the
core framework, the modules or themes you install, and your own custom templates. 

Silverstripe CMS templates are simple text files that have an `.ss` extension. They can contain any markup language (e.g HTML, 
XML, JSON..) and are processed to add features such as `$Var` to output variables and logic controls like 
`<% if $Var %>`. In this guide we'll look at the syntax of the custom template engine [SSViewer](api:SilverStripe\View\SSViewer) and how to render
templates from your controllers.

[CHILDREN Exclude=How_Tos]

## How to's

[CHILDREN Folder=How_Tos]

## Related Lessons
* [Migrating static templates into your theme](https://www.silverstripe.org/learn/lessons/v4/migrating-static-templates-into-your-theme-1)
