---
title: Unsaved changes indicator
summary: Configure and customise the CMS unsaved changes indicator shown on edit forms
icon: icon-clock
---

# Unsaved changes indicator

The CMS shows a small inline indicator on edit forms after a user has started editing the form (contains unsaved changes) after a configurable period of time. The indicator starts as a subtle "notice" and escalates to a more prominent "warning" after a second period. This helps editors remember to save their work and reduces accidental data loss.

![Unsaved changes indicator screenshot](../../_images/unsaved-changes-indicator.png)

The indicator activates only when the form has started editing the form. When the form then changes to a state where there are no unsaved changes, either by saving or reverting the unsaved changes, then its timer resets. By default, a notice appears after 5 minutes, escalating to a warning after 10 minutes. Notice and warning are independent levels; you can disable either or both through configuration.

## Configuration

You can configure the indicator using YAML. The configuration controls the intervals in minutes for the two levels.
Set either level to `0` to disable that level. Set both to `0` to disable the indicator entirely.

Example: change the notice to 10 minutes and the warning to 20 minutes

```yml
SilverStripe\Admin\Forms\UnsavedChangesIndicator:
  minutes:
    notice: 10
    warning: 20
```

To disable the warning level only:

```yml
SilverStripe\Admin\Forms\UnsavedChangesIndicator:
  minutes:
    warning: 0
```

To disable the indicator entirely:

```yml
SilverStripe\Admin\Forms\UnsavedChangesIndicator:
  minutes:
    notice: 0
    warning: 0
```
