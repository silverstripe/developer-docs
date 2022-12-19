---
title: Upgrading a project to CMS 5
summary: 
---

### Updating your codebase to use Silverstripe CMS 5 API

You'll need to go through your codebase to remove references to deprecated APIs and update your project logic.

Silverstripe CMS 5 introduces many API changes. They include are deprecation message that will either tell you:
- To simply use an different yet equivalent API instead, or
- The API in question has no replacement. This is usually for API that was mostly irrelevant.

To see deprecation warnings in your project and in your projects CI, add the `SS_DEPRECATION_ENABLED=true` to your projects `.env` file.

Alternatively, add the following line to you projects `app/_config.php`
```php
Deprecation::enable()
```

Deprecation notices will only ever show if your `SS_ENVIRONMENT_TYPE` is set to `dev`

Your project will now start emitting deprecation warnings on the frontend if you are calling deprecated code, along with the different API you should now use instead provided it exists.

Not all API that was deprecated in CMS 4 that has an equivalent API has that API in CMS 4, some of the API is only available from CMS 5.  A good example of this is the upgrade for what powers the `SilverStripe\Control\Email\Email` class from `swiftmailer` in CMS 4 to `symfony/mailer` in CMS 5.  You'll need to upgrade to CMS 5 before you can access the `symfony/mailer` API.

In order to also see these API's that do not have an immediate replacement, add the following config to your project

```yml
SilverStripe\Dev\Deprecation
  showNoReplacementNotices: true
```