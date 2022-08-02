---
title: Major Release Policy
summary: Outline the major release lifecycle and support commitment for Silverstripe CMS
icon: comments
---

# Major Release Policy

## Scope of the policy

This policy applies to all commercially supported modules.

Community modules are not covered by this policy. Modules under the `silverstripe` vendor name that are not commercially supported are updated on a best effort basis.

## General approach to Major releases

Silverstripe CMS aims to deliver regular major releases at predefined intervals with a clear support timeline. The key objectives of this policy is to allow Silverstripe CMS project owners to plan major upgrades ahead of time

The main function of major releases is to ship *breaking changes* that can not be shipped in a minor releases. These changes are primarily aimed at making sure the major releases can be supported for the full duration of its lifecycle.

The lifecycle for a Silverstripe CMS major release line is:
- pre-release (undefined duration)
- active development (2 years)
- bug and security fixes (1 year)
- security fixes only (1 year).

The primary focus of major releases is to:
- upgrade third party dependencies
- remove and clean up deprecated APIs
- implement architectural changes that can not reasonably be introduced in a minor.

At launch, major releases may contain new features not present in the previous major release line. However, this is a secondary concern. New features will usually ship in minor releases.

## Upgrading to a new major release

Major releases are not backward compatible. Most projects will require at least some development work to upgrade to a new major release.

Silverstripe CMS provides a clear upgrade path to new major releases. This includes clear documentation on what breaking changes have been made to each area of Silverstripe CMS.

## Major release lifecycle

A Silverstripe CMS major release line follows a predefined life cycle. New Silverstripe CMS majors are released in odd years (e.g. 2023, 2025, 2027, etc). At any given time, only two major release lines are officially supported.

### Pre-release

A Silverstripe CMS stable major release is preceded by beta period of at least three month. 

The purpose of the beta period is to:

- allow early adopters to plan their upgrade
- identify bugs in the major release
- help community module add support for the new major early on.

Once a new major enters the beta period, it should be compatible with the dependencies intended to ship in the stable release. Substantial breaking changes should be avoided post-beta.

Prior to the beta period, alpha releases are published at the discretion of the development team.

### Stable release

New major releases of Silverstripe CMS are tagged between April and June of odd years.

### Active development

Once a major release is stable, it enters a period of active development. A major release in active development:
- Will receive regular minor releases that ships new feature and API in a backward compatible way.
- Will receive regular patches for low impact bugs and low severity security issues.

A major releases line will stay in "active development" of approximatively two years. "Active development" for a major release line ends when the follow up major release is tagged stable.

Only one major release line is in "active development" at once.

### Bug and security fixes

A Silverstripe CMS major release line enters the "bug and security fixes" phase once the follow major release is tagged stable.

Release lines in the "bug and security fixes" phase will receive:
- patches for low impact bugs
- patches for low low severity security issues. 

Release lines in the "bug and security fixes" phase will not receive:
- new feature or new APIs
- new minor releases.

A major release line stays in the "bug and security fixes" phase for 1 year.
### Security fixes only

At the end of "Bug and security fixes" phase, a Silverstripe CMS major release line transition to the "security fixes only" phase.

In the "security fixes only" phase, a Silverstripe CMS major release line will only receive patches for high impact security issues defined has having a CVSS of 7.0 or above.

### End-of-life

A Silverstripe CMS major release line will be end-of-life once its follow up major release line exit active development.

End-of-life major release do not receive any security fixes or bug fixes. 

## PHP Support commitments

Silverstripe CMS major releases tracks PHP releases. 

The Silverstripe CMS release cycle is built around the assumptions that:
- New PHP releases are shipped at the end of November on an annual basis.
- PHP releases are in full support for two years with 1 year of limited support. 

At launch, a Silverstripe CMS major release support all PHP version in full support. PHP versions in limited support are not supported at launch by new Silverstripe CMS majors.

Following the initial release of a Silverstripe CMS major, we will aim to add forward compatibility for the next PHP release. e.g.: Silverstripe CMS 5 at launch will support PHP 8.1 and PHP 8.2. Will aim to add support for an eventual PHP 8.3 release to CMS 5.

We try our best not to drop support for older PHP releases within Silverstripe CMS major release line even if those PHP release reach end-of-life.

## Dependency management

At launch new Silverstripe CMS majors aim to have all PHP and JS dependencies on their latest stable version. For dependencies offering a *Long Term Support* version, the latest LTS of that dependency will be preferred.

The Silverstripe CMS development team will define a list of "fixed dependencies" for each Silverstripe CMS major release line. *Fixed dependencies* will not changed for the lifetime of a Silverstripe CMS major release line.

Support for newer major releases of fixed dependencies will not be retroactively added to Silverstripe CMS major release line, even if the currently used version is end-of-life. The only exception is if the upgrade is necessary to fix a high impact bug or security vulnerability. We’ll only support 1 major release line of each fixed dependency.

Non-fixed dependencies may be upgraded to new major releases or swap out altogether within a Silverstripe CMS release line.

### Symfony support commitments

Symfony is a collection of common PHP libraries Silverstripe CMS uses. At launch, Silverstripe CMS majors will track the latest stable major of Symfony dependencies. A Silverstripe CMS major release line will not add support for later Symfony major release.

## Commercially supported module

Commercially supported modules are reviewed with each new major release. At launch, the list of commercially supported modules for that release line is explicitly defined.

New modules maybe added to the list of commercially for that major release line during its lifespan. We aimed not to withdraw support for modules for the duration of that major release life span.

Modules that are supported for one major release line may not be supported for follow up release line.

## Expected Major releases timeline

(Put a pretty Graphic here)