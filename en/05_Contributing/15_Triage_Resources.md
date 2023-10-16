---
title: Triage and peer review
summary: Canned responses and other resources used during triage and peer review
icon: users
---

# Triage and peer review

This page collates common resources that maintainers can use to efficiently and consistently manage incoming issues and
PRs.

## Merge Checklist

This list helps to ensure that PRs are in a good state before merging. Ideally it should be applied to the PR upon
initial triage, so that the contributor can check items off prior to the reviewer digging in. Some items may not be
relevant to every PR, and can be crossed out on a case-by-case basis.

* [ ] The target branch is correct
  * For code, see [picking the right version](./code/#picking-the-right-version)
  * For documentation, see [branches and commit messages](./documentation#branches-and-commit-messages).
* [ ] All commits are relevant to the purpose of the PR (e.g. no debug statements, unrelated refactoring, or arbitrary linting)
  * Small amounts of additional linting are usually okay, but if it makes it hard to concentrate on the relevant
    changes, ask for the unrelated changes to be reverted, and submitted as a separate PR.
* [ ] The commit messages follow our [commit message guidelines](./code/#commit-messages)
* [ ] The PR follows our [contribution guidelines](./code/)
* [ ] New features are covered with tests (back-end with unit/functional tests, front-end with Behat)
* [ ] Any relevant User Help/Developer documentation is updated; for impactful changes, information is added to the
  changelog for the intended release
* [ ] CI is green
* [ ] At least one peer reviewer approved; no outstanding changes requested

## Canned Responses

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

### Enhancement Issue raised

**Context:** See the notes about feature requests in the [bug report](./issues_and_bugs/#feature-requests) and [contributing code](./code/#make-or-find-a-github-issue) pages for details.

> Thanks for your suggestion! As per our [contributing guide](./issues_and_bugs/#feature-requests) we don't typically
> accept feature requests as GitHub issues, but if you're willing to implement the feature in the near future we can
> leave the issue open to track discussion about it while you're working on it.
>
> Are you intending to implement this feature?

### Enhancement Issue raised without intention to implement

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
