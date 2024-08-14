---
title: Maintainer guidelines
summary: Cheat sheet for module maintainers
icon: clipboard-list
---

# Maintainer guidelines

The maintainer guidelines apply to [supported modules](./supported_modules/). Unsupported modules in the `silverstripe` GitHub organisation are not necessarily maintained by these roles. If there is an unsupported module in the `silverstripe` GitHub organisation that you would like to maintain, please email <community@silverstripe.org>.

This document outlines expectations on maintainers of Silverstripe CMS. It also forms the default expectations for maintainers of [supported modules](./supported_modules/), unless more specific contribution guidelines are available for a module.

> [!NOTE]
> A lot of extra information is available in the [Contributing](/contributing/) documentation.
> All maintainers should be familiar with those docs as they explain many details about how we work.

Refer to the [triage and peer review](/contributing/triage_resources/) for information about how those tasks are performed.

## Maintainer roles

Module maintainers are people taking care of the repositories, CI, documentation, source code, conventions, community communications, peer review, issue triage, and release management.

One of the most important maintainer responsibilities is to collaborate with other maintainers. Another important role is to facilitate community contributions (such as issue reports and pull requests).

The [maintainer house rules](#house-rules) must followed by all maintainers.

The following table outlines the general responsibilities and privileges attributed to each maintainer group - see the section for each group for further details.

|Responsibilities/privileges|Contribution Refiners|Peer Reviewers|CMS Squad Members|Core Committers|
|---|---|---|---|---|
|Triage issues|x|x|x|x|
|Review pull requests| |x|x|x|
|Merge pull requests| | |x|x|
|Administer repositories| | | |x|

### Core committers

The people looking after the Silverstripe CMS Core modules.
See the details on the [Core Committers](./core_committers) page.

### CMS squad

Beyond the Core Committer role, there can be individuals which
focus on core development work and are full-time employees of Silverstripe.

The CMS Squad require write access to core repositories to maintain their pace,
often working alongside Core Committers.

CMS Squad members have write access to core repositories in order to work effectively with GitHub issues. They are expected to use those permissions with good judgement for merging pull requests.

### Peer reviewers

> [!NOTE]
> This is a new role, and is currently in a trial period. It is likely to change over time as we learn what works and what doesn't.

This role is made up of community members who have demonstrated a willingness and ability to improve Silverstripe CMS through their contributions to the open source supported modules. It empowers community members to have a more active role in ensuring pull requests get merged, and builds more momentum for community-created pull requests.

While anyone in the community can review a pull request, only reviews from maintainers have weight of authority - and only maintainers can meaningfully approve changes. The Peer Reviewer role ensures members of the community have that authority.

#### Responsibilities {#peer-reviewer-responsibilities}

- Review pull requests, ensuring documented processes and best practices are being followed
  - Refer to [how to review pull requests](/contributing/triage_resources/#how-to-review-pull-requests) and [contributing code](/contributing/code/)
- Escalate pull requests to Core Committers if the PR is very complex and you don't feel confident reviewing it
  - If another reviewer feels confident, they can offer to review it instead
- Escalate pull requests to Core Committers if the contributor is rude/argumentative/hard to deal with
  - If you feel confident doing so, politely request the contributor behave in accordance with our [code of conduct](./code_of_conduct), and close the pull request if they refuse to do so
- Make sure Core Committers and CMS Squad are aware when a pull request has been approved and is ready to be merged
- Don’t approve the pull request if you wouldn’t feel confident merging it - instead, say where you got to with it (e.g. tested, worked well locally, couldn’t find any problems but want another opinion) and get another reviewer to check it
  - If no other reviewer feels confident about it, but it seems like it’s probably a good change in general, escalate to Core Committers
- If at any point there is a disagreement between reviewers that seems unresolvable, escalate the discussion to Core Committers.
- If any pull requests seem to be fixing a security issue, immediately notify the CMS Squad and Core Committers

If a reviewer doesn’t review any pull requests in a 12 month period, a member of the Core Committers or the Silverstripe CMS Product Owner will reach out and ask if they want to continue being a reviewer. If they don’t respond within a month (or they respond saying they don’t want to be a reviewer anymore), their permissions will be revoked and they will be removed from the team.

If a reviewer fails to contribute for 18 months in a row, they will be removed from the team until such a time as they can commit to performing the responsibilities of the role.

#### Onboarding new peer reviewers

Members of the community may be invited by a Core Committer or the Silverstripe CMS Product Owner to join the peer review team if they:

- have shown an interest in helping to maintain Silverstripe CMS
- have shown themselves to be trustworthy
- follow the code of conduct
- have provided good contributions.

Those contributions could be any combination of:

- good quality bug reports
- good quality pull requests
- help refining issues and PRs
- unofficial pull request reviews.

These contributions must demonstrate clear communication, adherence to our contribution guidelines, and good collaboration skills.

Usually members of the contribution refiners team will be given priority consideration over community members who have not been part of the contribution refiners team.

Anyone in the Core Committers or Peer Reviewers teams plus the Silverstripe CMS Product Owner can put a name forward of someone they think would be a good fit. All core committers and reviewers and the Silverstripe CMS Product Owner will have a (timeboxed) chance to object. Then if there’s no objections, the prospective member is invited to join the team.

There will be a low-touch background check before inviting the contributor to the team, to validate that they are who they appear to be.

### Contribution refiners

> [!NOTE]
> This is a new role, and is currently in a trial period. It is likely to change over time as we learn what works and what doesn't.

This role is made up of community members who have demonstrated a willingness and ability to improve Silverstripe CMS through their contributions to the open source supported modules. It empowers community members to have a more active role in identifying and refining bug reports and pull requests with high value potential so that they can be resolved more quickly.

While anyone can perform most of the reponsibilities of this role, having this role is a useful way for the maintainers to be aware of contributions people are making and ensuring there is a clear channel of communication for escalating anything which needs to be escalated.

Having a role for refining issues and pull requests helps to ensure:

- high impact and high value contributions are prioritised
- contributions are in a good state by the time someone comes to work on the issue or review the pull request
- low quality contributions are closed.

It also gives community members a low-effort entry point to being involved outside of contributing code themselves.

#### Responsibilities {#refiner-responsibilities}

##### Refine issues

- Perform triage tasks as documented in [how to triage](/contributing/triage_resources/#how-to-triage)
- Ensure bug reports contain valid reproduction steps and sufficient context to understand what the buggy behaviour is
- Ensure feature requests are either created by a maintainer, or the person who created the issue plans to implement it (see [feature requests](/contributing/issues_and_bugs/#feature-requests) and [make or find a GitHub issue](/contributing/code/#make-or-find-a-github-issue))
- Close feature requests if the person raising the issue indicates (either explicitly, or implicitly by not responding) that they aren’t going to implement the feature
- Encourage people raising issues to also raise pull requests to resolve the issue
- Close issues that aren’t in scope (e.g. spam, people seeking support, bug reports for non-supported versions, etc)
  - Direct people opening such issues to the correct channels if there is one, e.g. [community channels](https://www.silverstripe.org/community) for support
- Make sure the CMS Squad and Core Committers are aware of any critical or near-critical issues that need to be addressed in a timely manner
- If any issues seem to be reporting a security issue, immediately notify the CMS Squad and Core Committers

##### Refine pull requests

The following apply to pull requests that nobody has started reviewing yet. Once someone has started reviewing a pull request, the refiner should step back.

- Ensure pull requests link to an issue that the PR resolves
  - If one doesn’t exist, either open one or ask the pull request creator to open one
- Ensure pull requests have a clear description indicating the purpose of the change(s) if the linked issue doesn't provide enough context on its own
- Ensure commit messages in pull requests are appropriate and meaningful, and use the correct prefix (see [commit messages](/contributing/code/#commit-messages))
- Ensure pull requests target the correct branch (see [picking the right version](/contributing/code/#picking-the-right-version))
- If any pull requests seem to be fixing a security issue, immediately notify the CMS Squad and Core Committers

#### Onboarding new refiners

Members of the community may be invited by a Core Committer or the Silverstripe CMS Product Owner to join the contribution refiners team if they:

- have shown an interest in helping to maintain Silverstripe CMS
- have shown themselves to be trustworthy
- follow the code of conduct
- have provided good contributions.

Those contributions can be:

- good quality bug reports
- good quality pull requests
- help refining issues and PRs
- unofficial pull request reviews.

These contributions must demonstrate clear communication, adherence to our contribution guidelines, and good collaboration skills.

Anyone in the Core Committers or Contribution Refiners teams plus the Silverstripe CMS Product Owner can put a name forward of someone they think would be a good fit. All core committers and refiners and the Silverstripe CMS Product Owner will have a (timeboxed) chance to object. Then if there’s no objections, the prospective member is invited to join the team.

There will be a low-touch background check before inviting the contributor to the team, to validate that they are who they appear to be.

## Guidelines

With great power (write access) comes great responsibility.

First and foremost rule of a maintainer is to collaborate with other maintainers. Follow the house rules and remember that others also care about the modules they maintain.

### House rules

- Be friendly, encouraging and constructive towards other community members
- Be familiar with our contribution guidelines, especially the [definition of public API](./public_api/) and how that ties into our branching and release strategies
- If you have any questions or doubts, always ask - there's a lot of process and domain knowledge, and it is important that you feel confident to fulfil your role
- Frequently review pull requests and new issues (in particular, respond quickly to @mentions)
- Treat issues according to our [issue guidelines](/contributing/issues_and_bugs/), and use the [triage resources](/contributing/triage_resources/)
- Don't commit directly to existing branches, raise pull requests instead
- Use forks to create feature branches for pull requests
- Only approve and merge code you have tested and fully understand. If in doubt, ask for a second opinion.
- Follow the [Supported Modules Standard](https://www.silverstripe.org/software/addons/supported-modules-definition/)
- Ensure contributions have appropriate [test coverage](/developer_guides/testing/), are documented, and adhere to our [coding conventions](/getting_started/coding_conventions/)
  - If the contributor has trouble adding tests or documentation, you can raise your own pull requests that adds tests or documentation for the change and then merge their change
- Keep the codebase stable at all times (check our [release process](/contributing/release_process/))
  - If there are CI failures which are unrelated to the changes a given pull request, you can approve and merge the pull request if all relevant tests are being run and passing
- Changes must be merged into the appropriate branches and follow semantic versioning (see [picking the right version](/contributing/code/#picking-the-right-version))
- Be inclusive. Ensure a wide range of Silverstripe CMS developers can obtain an understanding of your code and docs, and you're not the only one who can maintain it.
- Avoid `git push --force`, and be careful with your git remotes (no accidental pushes)
- Assign yourself to the issue(s) you are reviewing. If you’re reviewing one pull request in that issue, you’re reviewing them all.
- Before merging a pull request, check the linked issue for related pull requests which should be reviewed and merged together.
- Don’t merge documentation for code changes until the code changes have been merged.
