---
title: Bug Reports
summary: Report bugs or problems with Silverstripe CMS, feature requests or other issues.
icon: bug
---

# Bug Reports

## Reporting Bugs

[alert]
If you think you've found a security issue, please use [the specific process](#reporting-security-issues) for those. Do _not_ raise a security issue in GitHub.
[/alert]

If you have discovered a bug in Silverstripe CMS, we'd be glad to hear about it -
well written bug reports can be half of the solution already!

Silverstripe CMS uses [GitHub](https://github.com/) to manage bug reports. If you
want to report a bug, you will need to [create a GitHub account](https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account)
and log in.

Before submitting a bug:

 * Ask for assistance in our [community channels](https://www.silverstripe.org/community) if you're unsure if it's really a bug.
 * Search for similar, existing issues.
   You can [list all issues across modules](https://www.silverstripe.org/community/contributing-to-silverstripe/github-all-core-issues),
   then add your search phrase at the start of the existing search filters (for example [all issues with label "type/ux"](https://www.silverstripe.org/community/contributing-to-silverstripe/github-all-open-ux-issues))
 * Is this a security issue? Please follow our [security reporting guidelines](#reporting-security-issues) below.
 * Try to reproduce your issue on a [clean installation](/getting_started/composer#create-a-new-site) to rule out bugs in your own code.

If the issue does look like a new bug:

 * Create an issue on the right module repository in GitHub
   * If you are unsure, [create an issue](https://github.com/silverstripe/silverstripe-framework/issues/new) on the the "framework" repository.
   * Note that [documentation issues](https://github.com/silverstripe/developer-docs/issues) are tracked in the "developer-docs" repository.
 * Describe the steps required to reproduce your issue, and the expected outcome. Example code, screenshots, and videos can help here.
   Be as clear as you can, but don't miss any steps out. Simply saying "create a page" is less useful than guiding us through the steps you're taking to create a page, for example.
 * If the bug is too complex to reproduce with some short code samples, please reproduce it in a public repository and provide a link to the repository along with steps for setting up and reproducing the bug using that repository.
   A repository like this should only contain code that is required to set up and reproduce the bug.
 * Describe your environment in as much detail as possible. Include the versions of relevant modules, the PHP version, webserver, and operating system used to run the project, the browser(s) you see the issue in, etc.
 * If part of the bug includes an error or exception, please provide a full stack trace. Be wary that stack traces may contain sensitive information, and if that is the case, be sure to redact them prior to posting your stack trace.
 * You are strongly encouraged to [submit a pull request](/contributing/code/#step-by-step-from-forking-to-sending-the-pull-request) which fixes the issue. Bug reports which are accompanied with a pull request are a lot more likely to be resolved quickly.

Lastly, don't get your hopes up too high. Unless your issue is a blocker
affecting a large number of users, don't expect Silverstripe developers to jump
onto it right way. Your issue is a starting point where others with the same
problem can collaborate with you to develop a fix. If this bug is a blocker
for you, then [submitting a pull request](/contributing/code/#step-by-step-from-forking-to-sending-the-pull-request)
is the best way to ensure it gets fixed.

## Feature Requests

[warning]
Please don't file feature requests as Github issues. If there's a new feature
you'd like to see in Silverstripe CMS, you either need to write it yourself (and
[submit a pull request](/contributing/code/#step-by-step-from-forking-to-sending-the-pull-request)) or convince somebody else to
write it for you. Any "wishlist" type issues without code attached can be
expected to be closed as soon as they're reviewed.
[/warning]

In order to gain interest and feedback in your feature, we encourage you to
present it to the community through the [community channels](https://www.silverstripe.org/community).

## Reporting Security Issues

[warning]
If you think a bug may have security implications, do not create a GitHub issue for it. This may lead to a zero-day vulnerability.
[/warning]

Report potential security issues to [security@silverstripe.org](mailto:security@silverstripe.org). Emails sent to that address are
forwarded to a private mailing list and kick off a specific security process.

If you have any doubts or are unsure whether the bug you've found has security implications or not, please err on the side of caution
and email us about it.

Review our [Managing Security Issues](managing_security_issues) process to understand what happens once a vulnerability is reported.

Silverstripe CMS aims to ship security patches at pre-defined intervals when those issues are not actively exploited in the wild.
Review the [Security patch windows](../Project_Governance/Minor_release_policy#security-patch-windows) section of our minor release policy for more details.

Silverstripe CMS does not operate a _bug bounty_ program.
