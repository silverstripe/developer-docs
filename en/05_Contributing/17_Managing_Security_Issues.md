---
title: Managing Security Issues
summary: This document highlights how the Silverstripe CMS security team handles security issues.
iconBrand: shield-alt
---

# Managing Security Issues

This document aims to provide a high level overview of how the Silverstripe CMS security team handles security issues. Only members of the Silverstripe CMS security team can perform the actions outlined in this document.

## Broad approach

While the process for handling security issues is publicly visible, only a limited number of participants are privy to the internal pre-disclosure discussions around specific vulnerabilities. 

We aim to release security fixes with our regularly scheduled minor releases to minimise disruption to Silverstripe CMS projects. This allows security releases to go through our regular regression testing. We will usually hold back security fixes for a few weeks or months while we wait for the next scheduled release.

If there's indication that a vulnerability is actively exploited in the wild or if the vulnerability has already been disclosed, a patch will be developed and released as soon as possible. In the case of a zero-day vulnerability, we will endeavour to provide mitigation steps to the Silverstripe CMS community while a patch is being developed.

### Silverstripe CMS security team

Silverstripe staff are granted access to review undisclosed security issues on a need-to-know basis and are bound by their employment contracts. Core committers not currently employed by Silverstripe are allowed to review undisclosed security issues after signing a non-disclosure agreement.

## Handling security issues confidentially 

This process is relevant when a potential vulnerability is reported confidentially and the Silverstripe CMS development team is in a position to prepare a patch prior to the public disclosure of the vulnerability.

This process is usually started once someone [reports a security issue](issues_and_bugs/#reporting-security-issues).

### When receiving a report

1. An automated response is sent back to the reporter to acknowledge receipt of their vulnerability report.
2. Perform an initial assessment of the report.
3. [Create a issue in our private security repository](https://github.com/silverstripe-security/security-issues/issues/new) unless the report is obviously invalid. e.g. SPAM.
4. Clarify who picks up and owns the issue (assign in Github).
  The owner can be separate from the developer resolving the issue,
  their primary responsibility is to ensure the issue keeps moving through the process correctly.
5. If encrypted information or attachments are provided, attach them to the private security issue.
6. Reply to [security@silverstripe.org](mailto:security@silverstripe.org) ONLY (i.e. do not include the reporter in this reply) and provide a link to the private security issue. Keep most of the discussion on GitHub.
7. Perform a criticality assessment to determine how severe the issue is and if it can be replicated.
    - You may need to seek additional information from the reporter before completing the criticality assessment.
    - Validate the assessment with at least one other member of the security team before replying to the reporter with your conclusion.
8. Use the [CVSS Calculator](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator) to determine the issue severity.
9. Ensure the reporter is given a justification for all issues we conclude are not security vulnerabilities.
10. Add the new issue in the "Backlog" on the [project board](https://github.com/silverstripe-security/security-issues/projects/1).
11. Once the issue is confirmed, [create a draft security advisory](#creating-a-github-security-advisory) against the relevant GitHub repository. This will allow you to request a CVE.
12. Once a CVE has been assigned, add it to the Github issue and respond to the issue reporter.
    - Ask the reporter if they want to be credited for the disclosure and under what name.


### Developing a fix

- Move the issue into "In Progress" on the [project board](https://github.com/silverstripe-security/security-issues/projects/1)
- If the silverstripe-security GitHub organisation doesn't have a pre-existing private repo for the module that needs to be fixed, create one and push the public git history to it. You can not do a private fork of a public repo.
- Identify the oldest supported minor release where the vulnerability should be patched for each major release line. (see [Supported Versions](release_process/#supported-versions))
- Make sure the target branches on the private repo are up-to-date with the public repo branches.
- Create a fix for each supported major release line and open PRs against the appropriate branches on the private repo. 
- Ensure that all security commit messages are prefixed with the CVE. E.g. "[CVE-2019-001] Fixed invalid XSS"
  - If there is no CVE assigned yet, use "[CVE-????-???]" for the prefix, and update it once a CVE is assigned.
- Once peer review is completed on the private PRs, do **not** merge it. The PRs should remain open until the fix is released publicly.

### Before release

- For issues rated "high" or "critical" (CVSS of >=7.0), post a pre-announcement to the [security pre-announcement list](https://groups.google.com/a/silverstripe.com/forum/#!forum/security-preannounce).
  It should include a basic "preannouncement description" which doesn't give away too much,
  the CVSS score, and the CVE identifier.
- Create a draft page under [Open Source > Download > Security Releases](https://www.silverstripe.org/admin/pages/edit/show/794).
  Populate it with the information from the [Github project board](https://github.com/silverstripe-security/security-issues/projects/1).
- Link to the individual silverstripe.org security advisory pages in the changelog.
- Update the _draft security advisory_ on GitHub to use the latest wording and link to the advisory on silverstripe.org.
- Move the issue to "Awaiting Release" in the [project board](https://github.com/silverstripe-security/security-issues/projects/1)
 
### After release

- Publish the security advisory release page on silverstripe.org.
- Publish the security advisory on GitHub. This will also publish the CVE.
- Respond to the issue reporter with a link to the security advisory on the same discussion thread (cc security@silverstripe.org).
- Open a pull request to the [FriendsOfPHP/security-advisories](https://github.com/FriendsOfPHP/security-advisories) repository.
- Move the issue to "Done" in the [project board](https://github.com/silverstripe-security/security-issues/projects/1)

### Creating a GitHub security advisory

GitHub security advisories allow you to request a CVE and attached them a CVSS score. A draft security advisory should be created against the repository where the vulnerability will be patched. If a vulnerability requires patches against multiple modules, aim to create the advisory against the module most directly affected.

In the GitHub _draft security advisory_, we follow certain conventions on fields:
- **Affected product** should have one entry for each composer package affected by the vulnerability. If the patch is backported to older release lines, there should be entries for those older releases.
  - **Ecosystem** should always be `composer`.
  - **Package name** must match the package name in Packagist.
  - **Affected versions** must be a string representing a range of versions affected by the vulnerability.
  - **Patched versions** must list the versions where the vulnerability was/will be patched.
- **Severity** must be set to *Assess severity using CVSS* and the CVSS option must be specified in the calculator.
- **Common weakness enumerator (CWE)** should be left blank if no suitable option can be found in the list.
- **CVE identifier** must be set to "Request CVE ID later" until we have had a CVE assigned.
- **Title** and **Description** should be descriptive enough that people can evaluate the risk without being so specific that would-be-hackers can start exploiting them right away.

These settings can be changed later, so if you are missing information when you first create the draft you can come back to add the information later.

## Special circumstances

### An issue has been reported publicly on GitHub

Occasionally, some developers will open a public issue on GitHub reporting a vulnerability, either because they are unaware of the proper process or because they did not immediately grasp the security implication of the bug being reported.

In those situations, the security team will assess how likely it was that the vulnerability was widely noticed based on how long the issue was opened on GitHub, whether there were any interactions from other GitHub users, and how explicit the description was. If the risk of the vulnerability having been noticed is small, an owner on the Silverstripe GitHub organisation will delete the public facing issue and create a private one instead.

If it's likely that the issue was noticed publicly, it should be handle as a zero-day vulnerability and patched as soon as possible.

### Handling issues on Huntr

[Huntr.dev](https://huntr.dev/) is an open source vulnerability bounty platform. The security team occasionally receives vulnerability reports from Huntr. Reports from Huntr go through the same process as reports received through other methods unless otherwise mentioned in this section. The security team should take the following points into consideration when working on a Huntr issue:

- Replying to a report from Huntr via email will record your response in Huntr, but it will not record who the response is from. To keep the discussion flowing more naturally, it is preferable to login into Huntr with your GitHub account and respond via the Huntr interface.
- People reporting vulnerabilities via Huntr are not always familiar with Silverstripe CMS. Don't assume that they have much context on what Silverstripe CMS is used for.
- Take some time to review the reporter's profile to see how serious and reliable they are.
- Validate what CVSS score the reporter has suggested for the issue.
- Once we "confirm" an issue in Huntr, it means that we agree the bug exists and that it's a vulnerability. Only confirm an issue if you have concluded that it is a valid security vulnerability that we will fix through the normal security process and have validated this conclusion with at least one other member of the security team. Security _enhancements_ should not be confirmed.
- By default, Huntr will issue CVEs for issues reported through their platform. We've disabled this functionality.
- Marked the issue as "fixed" in hunter once a patched has been released.

### A vulnerability has been reported against a dependency of Silverstripe CMS

Silverstripe CMS relies on many other dependencies which are outside of our control. Those dependencies will occasionally have vulnerabilities reported and patched against them.

When a vulnerability is disclosed against a Silverstripe CMS dependency, we generally do not consider this a vulnerability in Silverstripe CMS and will not issue a CVE for it.

We will consider taking actions if:
- the vulnerability is compounded by the specific way the dependency is used within Silverstripe CMS or
- a Silverstripe CMS constraint prevents the installation of a patched version of the dependency.

As a general principle, Silverstripe CMS composer constraints do not preclude the installation of dependencies with known vulnerabilities. It is the responsibility of Silverstripe CMS project owners to regularly update these constraints and to review the risk posed by specific vulnerabilities.

### SPAM vulnerability report

We receive a substantial amount of SPAM at our security email address. Those fall into 3 broad categories.

#### Straight up untargeted SPAM

Simply ignore these emails and mark them as SPAM in your email client.

#### Non-security requests

Our security email is the only email address bots can find on our website. We get a lot of generic requests. e.g. _Your site is awesome, would you like me to contribute a guest post?_

Provide a cursory response such as:

> This email address is only used to report potential security issues with Silverstripe CMS.

If more invalid requests are received from that sender, they should be blocked from the mailing list.

#### Low quality security reports

We get a lot of boiler plate vulnerability reports from individuals hoping to collect bounties. These requests are usually crafted to obscure their non-sensical nature.

When dealing with this kind of request, provide a brief response explaining why the request is invalid and include some boiler plate language such as:

> Silverstripe does not operate a bug bounty program.

Consider blocking repeat offenders from the the mailing list.
