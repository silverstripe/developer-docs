---
title: Javascript coding conventions
summary: The Javascript style guidelines we follow in our open source software
iconBrand: js
---

# JavaScript Coding Conventions

## Overview

This document provides guidelines for code formatting to developers contributing
to SilverStripe. It applies to all JavaScript files in core modules.

## NPM Packages

SilverStripe authored npm dependencies are posted under the
[silverstripe npm](https://www.npmjs.com/org/silverstripe) organisation.

## Browser support

Check our [requirements](/getting_started/server_requirements) documentation.

## Conventions

We follow the [AirBnB JavaScript Conventions](https://github.com/airbnb/javascript),
as well as the [AirBnB React Conventions](https://github.com/airbnb/javascript/tree/master/react).
A lot of their rules can be validated via [ESLint](http://eslint.org/),
and can be checked locally via `yarn lint` (see [Build Tooling](/contributing/build_tooling)).

## Spelling

All symbols and documentation should use UK-English spelling (e.g. "behaviour" instead of "behavior"),
except when necessitated by third party conventions (e.g using "color" for CSS styles).

## File and Folder Naming

- All frontend files (CSS, JavaScript, images) should be placed in
  a `client/` folder on the top level of the module
- File names should follow the [AirBnB Naming Conventions](https://github.com/airbnb/javascript#naming-conventions)
- The `client/src/components` folder should contain only React
  [presentational components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.r635clean).
  These components should be self-contained, and shouldn't know about Redux state.
- The `client/src/containers` folder should contain only React
  [container components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.r635clean)
- React classes in `client/src/components` and `client/src/containers` should
  have one folder per component, alongside a `README.md` and SCSS files where applicable.
- The `client/src/state` folder should contain [Redux](http://redux.js.org/)
  actions, action types and reducers. Each set of these should be kept in a folder
  named the same as its [reducer state key](http://redux.js.org/docs/basics/Reducers.html).
- JavaScript that pertains specifically to [entwine](/developer_guides/customising_the_admin_interface/cms_architecture/#javascript-through-jquery-entwine) logic belongs in a `client/src/legacy` directory.
- JavaScript tests should be named after the module/class/component they're testing,
  with their file name suffixed with `-tests.js`.
- JavaScript tests should be placed in a `tests/` subfolder alongside the module code.

## Related

* [PHP Coding Conventions](/contributing/php_coding_conventions)
* [CSS Coding Conventions](/contributing/css_coding_conventions)
