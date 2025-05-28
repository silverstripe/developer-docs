---
title: Release policy
summary: Outline the release lifecycle and support commitment for Silverstripe CMS
icon: code-branch
---

# Silverstripe CMS release policy

This document outlines the unified release policy for Silverstripe CMS and its commercially supported modules. Its purpose is to provide clear guidance on the types of releases, their cadence, scope, and support lifecycle, ensuring predictability and stability for our users and developers.

## 1. Release types and cadence

Silverstripe CMS adheres to [Semantic versioning](https://semver.org/) for its release philosophy.

### 1.1 Major releases (X.0.0)

Major releases are the cornerstone for introducing significant evolution and breaking changes to the Silverstripe CMS platform.

* **Purpose:** To deliver breaking changes and architectural updates that cannot be shipped in minor releases due to backward compatibility constraints.

* **Backward compatibility:** Major releases are **not backward compatible**.

* **Frequency:** New Silverstripe CMS major versions are released every **two years**.

* **Tagging period:** New major releases are typically tagged as stable between **April and June** of their release year.

* **Scope:** This policy applies to all Silverstripe CMS commercially supported modules. At launch, the list of commercially supported modules for that specific major release line will be explicitly defined.

* **Pre-release period:** A stable major release is always preceded by a **beta period of at least three months** to allow for extensive testing and feedback.

* **Dependency alignment:** At launch, Silverstripe CMS major releases aim to:

  * Support all PHP versions currently in full support.

  * Have all PHP and JavaScript dependencies on their latest stable versions.

* **Upgrade path:** Silverstripe CMS commits to providing a clear upgrade path to new major releases, including comprehensive documentation on all breaking changes and migration guides.

### 1.2 Minor releases (X.Y.0)

Minor releases provide ongoing value and improvements within a stable major release line.

* **Purpose:** To ship new features, enhancements, performance improvements, and bug fixes that cannot be shipped in a patch releae due to API additions.

* **Backward compatibility:** Minor releases are **backward compatible** within their major release line. They will not introduce breaking changes.

* **Frequency:** Minor releases are shipped every **six months** within an active major release line, typically targeted for **April and October**. There will be **five** minor releases per major release.

* **Pre-release period:** Minor releases are typically preceded by a **beta period of approximately six weeks** and a **release candidate (RC) period of approximately two weeks**. A feature freeze is implemented after the beta phase.

### 1.3 Patch releases (X.Y.Z)

Patch releases address critical issues swiftly to maintain stability and security.

* **Purpose:** To deliver bug fixes and security updates.

* **Backward compatibility:** Patch releases are **backward compatible** within their major and minor release line. They will not introduce new features or breaking changes.

* **Frequency:** Patch releases are shipped on an as-needed basis in response to identified bugs or security vulnerabilities. They do not follow a fixed schedule.

## 2. Support lifecycle

Silverstripe CMS maintains a clear support lifecycle for versions that have a stable releases to provide long-term stability and planning for users. Each minor release version progresses through defined support phases:

* **Full support:** Receives bug fixes and updates for all indentified security vulnerabilies.

* **Partial support:** Receives no bug fixes. Receives security updates for high and critical security vulnerabilities only (defined as those with a **CVSS score of 7.0 or above**). Low and medium level security vulnerabilities are not fixed.

* **End-of-life (EOL):** These minor versions receive no further support, bug fixes, or security updates. Users are strongly encouraged to upgrade to a supported version.

Most minor releases start with **six months** of full support which is followed by **six months** of partial support. The last minor release of major version, typically the X.4 release, has an extended support length which is **one year**.of full support which is followed by **one year** of partial support.

## 3. Communication and documentation

For all release types, Silverstripe CMS is committed to clear and timely communication:

* **Release announcements:** All major, minor, and patch releases will be announced through official Silverstripe channels.

* **Release notes:** Comprehensive release notes detailing new features, improvements, bug fixes, and security advisories will be published for every release.

* **Upgrade guides:** For major releases, detailed upgrade guides and documentation on breaking changes will be provided to assist users in migrating to the new version.
