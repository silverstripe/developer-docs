---
title: Template debugging
summary: Track down which template rendered a piece of html
icon: bug
---

# Debugging templates

## Source code comments

If there is a problem with the rendered html your page is outputting you may need
to track down a template or two. The template engine can help you along by displaying
source code comments indicating which template is responsible for rendering each
block of html on your page.

```yml
---
Only:
  environment: 'dev'
---
SilverStripe\View\SSViewer:
  source_file_comments: true
```
