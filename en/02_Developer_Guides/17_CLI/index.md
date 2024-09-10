---
title: Command Line Interface (CLI)
summary: Automate Silverstripe CMS, run Cron Jobs or sync with other platforms through the Command Line Interface.
introduction: Automate Silverstripe CMS, run Cron Jobs or sync with other platforms through the Command Line Interface.
icon: terminal
---

# Command line interface (CLI)

Silverstripe CMS comes with a CLI application powered by [`symfony/console`](https://symfony.com/doc/current/console.html). The applicaiton is called "Sake".

This application comes with several useful commands out-of-the-box, and can be customised by projects and modules with additional functionality.

> [!WARNING]
> Your command line PHP version is likely to use a different configuration as your webserver (run `php -i` to find out
> more). This can be a good thing, your CLI can be configured to use higher memory limits than you would want your website
> to have.

[CHILDREN includeFolders]
