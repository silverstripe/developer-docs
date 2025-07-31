---
title: Release policy
summary: Outlines the release lifecycle and support commitments for Silverstripe CMS
icon: code-branch
---

# Release policy

The purpose of this policy is to provide clear guidance on the release of new Silverstripe CMS versions and their support lifecycle, ensuring predictability and stability for users and developers.

This policy only applies to [commercially supported modules](/project_governance/supported_modules/).

Other unsupported modules in the `silverstripe` GitHub organisation and community modules are not covered by this policy.

Silverstripe CMS uses [semantic versioning](https://semver.org/).

Refer to our [definition of public API](/project_governance/public_api/) for details on allowed changes within releases.

## Definitions

- **Silverstripe CMS version**: The version number corresponding to a Silverstripe CMS release, e.g. "6.1"
- **Silverstripe CMS release**: A combined release of commercially supported modules which together make up Silverstripe CMS. Also known as a "stable release"
- **Silverstripe CMS major version series**: All Silverstripe CMS versions that start with the same whole number, e.g. "6.0", "6.1", and "6.2" are all in the same "CMS 6" major release series

### Pre-release definitions

- **Alpha**: A pre-release that may be performed prior to a "beta" pre-release. Its purpose is to allow for early exploration and feedback on foundational changes, new architectural approaches, or significant new features
- **Beta**: A pre-release which is performed prior to a "RC" pre-release. Its purpose is to facilitate testing and feedback, allow early adopters to plan their upgrade, to identify bugs, and to help community modules dependent on Silverstripe CMS to upgrade ahead of the stable release
- **Release candidate (aka RC)**: A pre-release that is performed prior to a stable release. A copy of the release candidate (which also includes any undisclosed security patches) will be sent to an external auditor for a security review. This pre-release should be very similar to the final stable release and is a last chance to find any regressions before then.

## Types of Silverstripe CMS releases

Regular Silverstripe CMS releases are performed at predefined intervals with a clear support timeline. This allows Silverstripe CMS project owners to plan upgrades ahead of time.

> [!NOTE]
> The cadence and pre-release timeframes are indicative only. We may alter those in response to external constraints.
> 
> While each Silverstripe CMS release usually only gets one of each type of pre-stable release, additional pre-stable releases may be performed if required.

### Silverstripe CMS major release

A new Silverstripe CMS major version series (e.g. "CMS 6") is introduced by its first Silverstripe CMS release (e.g. "CMS 6.0.0").

The main purpose of a major release is to deliver significant architectural updates and changes that are not backward compatible, including updates to third-party dependencies. This ensures the Silverstripe CMS major version series can be supported for its full lifecycle.

At launch, new Silverstripe CMS major versions may contain new features not present in the previous major version series. However, shipping new features is a secondary concern, as new features will usually ship in minor releases.

- **Backward compatibility:** No - projects will require some development work to upgrade to a new major release
- **Cadence:** Every two years, between April and June
- **Pre-release schedule:**
  - **Alpha**: At the discretion of the development team
  - **Beta**: At least 3 months prior to the anticipated stable release. At this point, dependencies should not change, and substantial breaking changes should be avoided.
  - **RC**: Approximately 4 weeks prior to the anticipated stable release. At this point, no more breaking changes can be made unless they are to fix a regression
- **Documentation:** A changelog is published listing significant new features and breaking changes. A [clear upgrade path](/upgrading) is available

### Silverstripe CMS minor release

A Silverstripe CMS minor release is the standard recurring release of Silverstripe CMS (e.g. "CMS 6.1.0", "CMS 6.2.0"). Minor release upgrades are generally more straightforward to manage than major release upgrades.

The main purpose of a minor release is to ship new features and enhancements.

- **Backward compatibility:** Yes - within their Silverstripe CMS major version series
- **Cadence:** Every six months within the most recent stable Silverstripe CMS major version series. Minor releases are targeted for April and October each year
- **Pre-release schedule:**
  - **Alpha**: Typically not performed
  - **RC**: Approximately 2 weeks prior to the stable release. At this point, only bug fixes should be added
  - **RC**: Approximately 2 weeks prior to the stable release. At this point, only bug fixes should be added
- **Documentation:** A changelog is published listing significant new features

## Support lifecycle

> [!INFO]
> For a detailed timeline of current and planned support durations for each Silverstripe CMS version, refer to the [support timeline](https://www.silverstripe.org/software/roadmap#support-timeline).

A clear support lifecycle for each Silverstripe CMS version is defined. This provides long-term stability and planning for users.

At any given time, only two major version series are officially supported. For example, CMS 5.4, CMS 6.0, and CMS 6.1 can all be supported at once as they span a total of two major version series, however, CMS 5.4, CMS 6.0, and CMS 7.0 cannot all be supported at once.

Each Silverstripe CMS version has a *standard* support length, except for the last minor version of a Silverstripe CMS major version series, which has an  *extended* support length, e.g. CMS 5.4 has extended support. Details about how this affects release timelines is detailed further below.

Support commitments for security and bug fixes are met through patch releases on individual supported modules and are detailed further in a section below.

Each Silverstripe CMS version progresses through three defined support phases.

### Full support

A Silverstripe CMS version enters the *full support* phase after the corresponding release has been performed.

- **Security fixes:** Yes – security vulnerabilities at all impact levels are addressed
- **Bug fixes:** Yes - provided they do not change existing public API
- **New features:** No
- **Enhancements:** Allowed
- **Support length:**

  - **Standard:** Approximately 6 months, until the next minor release is performed
  - **Extended:** One year

### Partial support

At the end of the *full support* phase, a Silverstripe CMS version transitions to the *partial support* phase.

- **Security fixes:** Partial – only high and critical impact security vulnerabilities (those with a CVSS score of 7.0 or above) are addressed
- **Bug fixes:** No
- **New features:** No
- **Enhancements:** No
- **Support length:**

  - **Standard:** 6 months
  - **Extended:** Approximately one year, extending until the subsequent major release (e.g. CMS 5.4 will remain in partial support until CMS 7.0 is released)

### End-of-life

Once the *partial support* phase for a Silverstripe CMS version has ended, it goes *end-of-life* This means the release is no longer supported.

- **Security fixes:** No
- **Bug fixes:** No
- **New features:** No
- **Enhancements:** No

> [!IMPORTANT]
> Users on end-of-life versions are strongly encouraged to upgrade to a supported version

## Patch releases

Patch releases are small code releases for individual modules such as `silverstripe/framework`. They can happen at any time and are not part of a broader Silverstripe CMS release. They are the delivery mechanism to fulfill the support commitments for Silverstripe CMS versions that are supported.

Patch releases should not make any public API changes. Because of this restriction, typically only bug and security fixes will be shipped in them.

## Security patch windows

Security fixes differ from regular bug fixes due to their sensitive nature. Security vulnerabilities are handled responsibly and not publicly disclosed before a patch is available.

Patches containing security fixes release at pre-defined intervals to make it easier to plan Silverstripe CMS project upgrades.

When a vulnerability is [confidentially reported](/contributing/issues_and_bugs/#reporting-security-issues) to the Silverstripe CMS development team and we are confident that the vulnerability is not actively being exploited in the wild, we will wait until the next available security patch window to disclose it and release a patch.

Security patch windows are scheduled to line up with our expected minor releases. Our security patch windows are in:

- January
- April
- July
- October

Any security fixes that are shipped at the same time as a new Silverstripe CMS release will be included in that release.

## PHP support commitments

The Silverstripe CMS release cycle is built around these assumptions:

- New PHP releases are shipped at the end of November on an annual basis.
- PHP releases are in full support for two years, followed by two years of support for critical security fixes only.

At launch, a Silverstripe CMS major release supports all PHP versions in full support. PHP versions in limited support are not supported by the new Silverstripe CMS major version series.

Following the initial release of a new Silverstripe CMS major version series, the development team aims to add forward compatibility for the next PHP release. For example: Silverstripe CMS 5.1 had support for PHP 8.1 and PHP 8.2 when it was released, PHP 8.3 had not been released at that stage, support for PHP 8.3 was added in Silverstripe CMS 5.2.

Support for end-of-life PHP releases is not dropped within a Silverstripe CMS major version series, unless it's necessary to address vulnerabilities or high impact bugs.

Silverstripe CMS major version series which will not have new minor releases do not receive official support for later PHP releases.

## Dependency management

At launch, Silverstripe CMS major releases aim to have all PHP and JavaScript dependencies on their latest stable versions. For dependencies offering a long term support (LTS) version, the latest LTS of that dependency is preferred.

A list of *fixed dependencies* for each Silverstripe CMS major version series is explicitly defined by the development team. Fixed dependencies do not change for the lifetime of a Silverstripe CMS major version series.

See [fixed dependencies](/project_governance/fixed_dependencies/) for the current list of fixed dependencies.

Support for newer major versions of fixed dependencies is not added to a Silverstripe CMS major version series, even if the currently used version is end-of-life. A Silverstripe CMS major version series only supports one major version each fixed dependency.

The only exceptions are:

- If the upgrade is necessary to fix a high impact bug or security vulnerability
- If the upgrade is necessary to add support for a new PHP version to a Silverstripe CMS major version series which will have future minor releases

Non-fixed dependencies may be upgraded to a new major version or swapped out altogether within a Silverstripe CMS major version series.

### Symfony dependencies

Symfony is a collection of common PHP libraries Silverstripe CMS uses. At launch, Silverstripe CMS major releases track the latest stable major version of Symfony dependencies. A Silverstripe CMS major version series does not add support for later Symfony major versions.

## Commercially supported modules

Commercially supported modules are reviewed with each new Silverstripe CMS major release. At launch, the list of commercially supported modules for that major version series is explicitly defined.

New modules may be added to the commercially supported modules list during a Silverstripe CMS major version series lifespan. Modules are not withdrawn from the commercially supported modules list for a Silverstripe CMS major version series unless external factors make it impractical to continue support. For example, if the module requires a discontinued third-party service to work as intended.

Modules that are supported for one Silverstripe CMS major version series might not be supported for subsequent Silverstripe CMS major version series. Supported modules can be renamed or their namespaces can be changed when a new Silverstripe CMS major version is released.
