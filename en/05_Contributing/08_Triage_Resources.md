---
title: Triage and peer review
summary: Canned responses and other resources used during triage and peer review
icon: users
---

# Triage and peer review

Triage and peer review are important processes for getting changes made and merged.

If you are involved with triage of Silverstripe CMS core and supported modules, regularly check the repository for new issues or use the ["Untriaged" filter](https://silverstripe-github-issues.now.sh/?mode=untriaged) in our cross-repository issue tracker.

You can also optionally subscribe to the repository via [GitHub watch functionality](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

[hint]
When performing these tasks, make sure to adhere to the [code of conduct](/project_governance/code_of_conduct/) and [maintainer guidelines](/project_governance/maintainer_guidelines/#guidelines).
[/hint]

## How to triage

Triaging issues involves review, applying labels, and closing invalid issues/PRs.

How to do it

- Read the docs about [how we use labels](./issues_and_bugs/#labels), and apply the relevant labels to any untriaged issues
- Request follow-up information if you can't reproduce the issue based on the information that has been provided
- Close any issues that seem like spam, are duplicates, are requesting support rather than reporting a bug, are feature requests that the reporter doesn't intend to implement, etc
  - Make sure to explain why you are closing the issue. There are some [canned responses](#canned-responses) that you can use
- For any issues you add the "impact/critical" label to, bring this to the attention of the Core Committers and the CMS Squad
- If unsure about anything, it’s usually good to ask other maintainers for their opinions (on Slack or via mentioning them directly on GitHub)

## How to review pull requests

Reviewing and merging PRs is one of the most critical responsibilities, which often requires a lot of effort and scrutiny.

Bad PRs may contain technical debt, provide problems in the future and require extra attention and time from the maintainers. It is usually better not to merge at all, rather than merge half-ready or poorly written code. Especially if a PR comes from a non-maintainer who’s not responsible for taking care of the feature later on. On the other hand, the nature of Open Source implies access to resources of the community, so it’s important to make sure we don’t close the doors for people willing to spend their time and brain energy.

How to do it

- Follow the [merge checklist](#merge-checklist). You may even post it straight on GitHub so the contributor sees the PR progress
- If the author doesn't respond for several weeks you may choose take the PR over and push it forward yourself by adding your own commits to their branch - in that case, you become the developer and someone else will need to review the pull request when you are done. Otherwise, it’s fine to close the PR if there has been no response and you don't want to take it over yourself.

### Merge checklist

This list helps to ensure that PRs are in a good state before merging. Ideally it should be applied to the PR upon
initial triage, so that the contributor can check items off prior to the reviewer digging in. Some items may not be
relevant to every PR, and can be crossed out on a case-by-case basis.

- [ ] The target branch is correct
  - For code, see [picking the right version](./code/#picking-the-right-version)
  - For documentation, see [branches and commit messages](./documentation#branches-and-commit-messages).
- [ ] All commits are relevant to the purpose of the PR (e.g. no debug statements, unrelated refactoring, or arbitrary linting)
  - Small amounts of additional linting are usually okay, but if it makes it hard to concentrate on the relevant
    changes, ask for the unrelated changes to be reverted, and submitted as a separate PR.
- [ ] The commit messages follow our [commit message guidelines](./code/#commit-messages)
- [ ] The PR follows our [contribution guidelines](./code/)
- [ ] New features are covered with tests (back-end with unit/functional tests, front-end with Behat)
- [ ] Any relevant User Help/Developer documentation is updated; for impactful changes, information is added to the
  changelog for the intended release
- [ ] CI is green
- [ ] At least one peer reviewer approved; no outstanding changes requested

## Canned responses

These are optional templates that can be [saved for re-use in GitHub](https://docs.github.com/en/github/writing-on-github/working-with-saved-replies),
serving as a starting point for working through common scenarios on issues and pull requests. Context is provided
below for each message, and it often makes sense for the maintainer to
expand upon the message with details specific to the given issue or PR.

### Stale PR warning

**Context:** In order to minimise the backlog of PRs that need attention from the core team, we periodically check in
on PRs that haven't seen any author activity for a while. We'll give you a heads up, and you'll a chance to
progress the work or respond to any outstanding feedback.

> This pull request hasn't had any activity for a while. Are you going to be doing further work on it, or would you
> prefer to close it now?

### Stale PR closure

**Context:** If we don't hear back or see any changes for a while after being asked if more changes will be made, we'll close the PR.

> It seems like there's going to be no further activity on this pull request, so we’ve closed it for now. Please open a
> new pull-request if you want to re-approach this work, or for anything else you think could be fixed or improved.

### Support issue raised

**Context:** We don't provide support through GitHub issues. If an issue is created that is requested support rather than reporting a bug, we'll close the issue and link to the community channels.

> We don't provide support through GitHub issues. The problems you're experiencing don't seem to be a result of bugs in Silverstripe CMS core or supported modules, so
> I'm going to close this issue. Please ask for support in our [community channels](https://www.silverstripe.org/community).

### Enhancement issue raised

**Context:** See the notes about feature requests in the [bug report](./issues_and_bugs/#feature-requests) and [contributing code](./code/#make-or-find-a-github-issue) pages for details.

> Thanks for your suggestion! As per our [contributing guide](./issues_and_bugs/#feature-requests) we don't typically
> accept feature requests as GitHub issues, but if you're willing to implement the feature in the near future we can
> leave the issue open to track discussion about it while you're working on it.
>
> Are you intending to implement this feature?

### Enhancement issue raised without intention to implement

**Context:** See the notes about feature requests in the [bug report](./issues_and_bugs/#feature-requests) and [contributing code](./code/#make-or-find-a-github-issue) pages for details.

> Just to let you know we're closing this feature request as GitHub issues are not the best
> place to discuss potential enhancements unless you're intending to implement the solution in the near future.
> You can read more about this in the [contributing guide](./issues_and_bugs/#feature-requests),
> and you are welcome to raise new feature ideas on the [Silverstripe forum](https://forum.silverstripe.org/c/feature-ideas)
> instead.

### Complex enhancement/new feature that doesn't fit core

**Context:** We generally try to avoid major additions to the core codebase, as they increase the maintenance burden
on the core team. Instead, we recommend pursuing major new features/enhancements as independent modules, which is
possible in most cases due to the broad extensibility of the core APIs.

Examples of high-value features that are developed as independent modules include
[silverstripe-terraformers/keys-for-cache](https://github.com/silverstripe-terraformers/keys-for-cache),
[dnadesign/silverstripe-elemental](https://github.com/silverstripe/silverstripe-elemental),
[symbiote/silverstripe-gridfieldextensions](https://github.com/symbiote/silverstripe-gridfieldextensions),
and [jonom/silverstripe-focuspoint](https://github.com/jonom/silverstripe-focuspoint).

> Thanks for your work on this pull request. Unfortunately the core team isn't able to prioritise integrating and
> supporting complex new features at this time, so we’ll need to close this now.
>
> If you’d like to take your idea further and share it with the community, we highly recommend turning your PR into an
> open source module and posting about it in the appropriate community channels. See the docs on
> [how to create a module](/developer_guides/extending/modules/#create).
