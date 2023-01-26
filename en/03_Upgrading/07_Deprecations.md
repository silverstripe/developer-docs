---
title: Deprecations
---

# Deprecations

## Updating your codebase to use avoid using deprecated API in Silverstripe CMS

You'll need to go through your codebase to remove references to deprecated APIs and update your project logic.

Major releases of Silverstripe CMS introduce many API changes. They include a deprecation message that will either tell you:
- to simply use a different yet equivalent API instead, or
- the API in question has no replacement. This is usually for API that was mostly irrelevant.

To see deprecation warnings in your project and in your project's CI, add `SS_DEPRECATION_ENABLED=true` to your project's `.env` file.

Alternatively, add the following line to you project's `app/_config.php`.
```php
Deprecation::enable()
```

Deprecation notices will only ever show if your `SS_ENVIRONMENT_TYPE` is set to `dev`.

Your project will now start emitting deprecation warnings on the frontend if you are calling deprecated code, along with the different API you should now use instead, if a replacement exists.

Not all API that gets deprecated will have an equivalent replacement API in that same major version; some of the API is only available from the next major release.  A good example of this is the upgrade for what powers the `SilverStripe\Control\Email\Email` class from `swiftmailer` in CMS 4 to `symfony/mailer` in CMS 5. In these cases, you'll need to upgrade to the new major version before you can access the replacement API.

Your project will emit deprecation notices for these, although there may be nothing you can do to stop calling that code until you upgrade to the new major version. In this case you should use the deprecation notice to construct a list of what you may need to change after upgrading.

Once you have resolved all of the deprecation notices you can, it is recommended to turn off deprecation notices again.
