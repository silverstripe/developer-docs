---
title: Minor Release Policy
summary: Outline the minor release lifecycle and support commitment for Silverstripe CMS
icon: code-branch
---

# Minor Release Policy

This policy complements the [Silverstripe CMS Major release policy](major_release_policy) by providing guidance on when new minor releases of Silverstripe CMS are shipped.

Note that the release cadence and pre-release time frame are indicative only. We may alter those in response to external constraints.

Our minor release policy is more flexible because minor release upgrades are more straightforward to manage than major release upgrades.

[info]
Refer to our [definition of public API](/project_governance/public_api/).
[/info]

## Scope of the policy

This policy applies to all [Silverstripe CMS commercially supported modules](/project_governance/supported_modules/).

Community modules are not covered by this policy. Modules in the `silverstripe` github organisation that are not commercially supported are updated on a best effort basis.

## Upgrading to a new minor release

Silverstripe CMS follows [semantic versioning](https://semver.org/). Silverstripe CMS minor releases deliver new features and new public API in a backward compatible way.

## Minor release cadence

Silverstripe CMS aims to ship a new minor releases every 6 months for the major release line in active development. Those minor releases are targeted for April and October each year.

### Pre-release

Silverstripe CMS does not usually tag alpha releases for minor releases.

Approximately 6 weeks prior to the anticipated stable minor release, a beta minor release is published. Once a beta release is tagged, any new feature or public API that didn't make it to the beta should be targeted to the follow up minor release. This allows the CMS development team to perform a regression test on the beta release with confidence that no additional regressions will be introduced before the stable release.

Approximately 2 weeks prior to the anticipated stable minor release, a release candidate is tagged. Once a release candidate is tagged, only critical impact bug fixes can be added to the release. The release candidate is sent to an external auditor for a security review. Any security patches which will be included in the stable release are also sent to the auditor.

### Stable release

New minor releases of Silverstripe CMS are tagged around April and October each year.

## Minor release support timeline

The minor release support timeline follows similar phases to those of a major release, but are more condensed.

### Bug and security fixes

A Silverstripe CMS minor release line enters the *bug and security fixes* phase once it is tagged *stable*.

A minor release in the *bug and security fixes* phase receives:
- bugfixes that do not change existing public API
- security patches for vulnerabilities at all impact levels.

It does **not** receive:
- new features
- new public API.

A minor release line stays in the *bug and security fixes* phase until a follow up minor release is tagged.

### Security fixes only

At the end of the *bug and security fixes* phase, a Silverstripe CMS minor release line transitions to the *security fixes only* phase.

In the *security fixes only* phase, a Silverstripe CMS minor release line only receives patches for high impact security issues defined as having a CVSS score of 7.0 or above.

### End-of-life

Six months after entering the *security fixes only* phase, the minor release goes *end-of-life*. No more security patches will be shipped for that minor release.

### The last minor release in a major release line

Shortly before tagging a new major release, one last minor release will be tagged for the major release line in active development.

The last minor release in a major release line will have an extended support phases in line with our [major release policy](major_release_policy).

## Security patch windows

Silverstripe CMS aims to deliver security patches at pre-defined intervals to make it easier to plan Silverstripe CMS project upgrades.

When a vulnerability is [confidentially reported](/contributing/issues_and_bugs/#reporting-security-issues) to the Silverstripe CMS development team and we are confident that the vulnerability is not actively being exploited in the wild, we will wait until the next available security patch window to disclose it and release a patch.

Security patch windows are scheduled to line up with our expected minor release. Our security patch windows are in:
- January
- April
- July
- October.

Any security fixes that are shipped at the same time as a new minor release will also be patched and tagged on the minor release that is entering the "bug and security fixes" phase.

## Patch releases

Silverstripe CMS tags patch releases of individual modules whenever relevant bug fixes or other very low risk changes are merged into a supported patch release branch.

Patches releases are not coordinated across modules and do not have a specific cadence.