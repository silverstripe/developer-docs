---
title: Maintainer guidelines
summary: Cheat sheet for module maintainers
icon: clipboard-list
---

# Maintainer Guidelines

This doc outlines expectations on maintainers of Silverstripe CMS. It also forms the default expectations for maintainers of [supported modules](./supported_modules/), unless more specific contribution guidelines are available for a module.

Module maintainers are people taking care of the repositories, CI, documentation, source code, conventions, community communications, peer review, issue triage, and release management.

One of the most important maintainer responsibilities is to collaborate with other maintainers. Another important role is to facilitate community contributions (such as issue reports and pull requests).

[note]
A lot of extra information is available in the [Contributing](/contributing/) documentation.
All maintainers should be familiar with those docs as they explain many details about how we work.
[/note]

Refer to the [triage and peer review](/contributing/triage_resources/) for information about how those tasks are performed.

## Maintainer Roles

### Core Committers

The people looking after the Silverstripe Core modules.
See the details on the [Core Committers](./core_committers) page.

### CMS Squad

Beyond the Core Committer role, there can be individuals which
focus on core development work and are full-time employees of Silverstripe.

The CMS Squad require write access to core repositories to maintain their pace,
often working alongside Core Committers.

CMS Squad members have write access to core repositories in order to work effectively with GitHub issues. They are expected to use those permissions with good judgement for merging pull requests.

## Guidelines

With great power (write access) comes great responsibility.

First and foremost rule of a maintainer is to collaborate with other maintainers. Follow the house rules and remember that others also care about the modules they maintain.

### House rules overview

* Be friendly, encouraging and constructive towards other community members
* Frequently review pull requests and new issues (in particular, respond quickly to @mentions)
* Treat issues according to our [issue guidelines](/contributing/issues_and_bugs/), and use the [triage resources](/contributing/triage_resources/)
* Don't commit directly to existing branches, raise pull requests instead
* Use forks to create feature branches for pull requests
* Only merge code you have tested and fully understand. If in doubt, ask for a second opinion.
* Follow the [Supported Modules Standard](https://www.silverstripe.org/software/addons/supported-modules-definition/)
* Ensure contributions have appropriate [test coverage](/developer_guides/testing/), are documented, and adhere to our [coding conventions](/getting_started/coding_conventions/)
* Keep the codebase "releasable" at all times (check our [release process](/contributing/release_process/))
* Follow [Semantic Versioning](/contributing/code/#picking-the-right-version) by putting any changes into the correct branch
* Be inclusive. Ensure a wide range of Silverstripe CMS developers can obtain an understanding of your code and docs, and you're not the only one who can maintain it.
* Avoid `git push --force`, and be careful with your git remotes (no accidental pushes)
