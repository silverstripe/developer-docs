---
title: Build tooling
summary: The tools we use to compile our frontend code
icon: tools
---

# Client-side build tooling

Core JavaScript, CSS, and thirdparty dependencies are managed with the build tooling
described below.

Note this only applies to core SilverStripe dependencies, you're free to manage
dependencies in your project codebase however you like.

## Installation

The [NodeJS](https://nodejs.org) JavaScript runtime is the foundation of our client-side
build tool chain. If you want to do things like upgrade dependencies, make changes to core
JavaScript or SCSS files, you'll need Node installed on your dev environment.

Our build tooling supports the v18.x ([LTS as of October 2022](https://github.com/nodejs/release#release-schedule)) version
of NodeJS.

If you already have a different version of NodeJS installed, check out the
[Node Version Manager](https://github.com/creationix/nvm) to run multiple versions
in your environment. We aim to have a `.nvmrc` file in each repository, so you just need
to run `nvm use` to swap to the correct node version.

[yarn](https://yarnpkg.com/) is the package manager we use for JavaScript and SCSS dependencies.
The configuration for an npm package goes in `package.json`.
You'll need to install yarn after Node.js is installed.
See [yarn installation docs](https://yarnpkg.com/en/docs/install).
We recommend using `npm` which comes with Node.js to install it globally.

```sh
npm install -g yarn
```

Once you've installed Node.js and yarn, run the following command once in the `silverstripe/admin` module folder and in each module folder you are working on:

```sh
yarn install
```

## The Basics: ES6, Webpack and Babel

[Webpack](https://webpack.github.io) contains the build tooling to
"transpile" various syntax patterns into a format the browser can understand,
and resolve ECMA `import` statements ([details](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)).
Webpack provides the entry point to our build tooling through a `webpack.config.js`
file in the root folder of each core module.

[Babel](https://babeljs.io/) is a JavaScript compiler. It takes JavaScript files as input,
performs some transformations, and outputs other JavaScript files. This allows us to use modern syntax
in source files, while ensuring the output is converted to syntax that is supported by the browser.
In SilverStripe we use Babel to transform our JavaScript in two ways.

## Build Commands

The `script` property of a `package.json` file can be used to define command line
[scripts](https://docs.npmjs.com/misc/scripts).
A nice thing about running commands from an npm script is binaries located in
`node_modules/.bin/` are temporally added to your `$PATH`. This means we can use dependencies
defined in `package.json` for things like compiling JavaScript and SCSS, and not require
developers to install these tools globally. This means builds are much more consistent
across development environments.

To run an npm script, open up your terminal, change to the directory where `package.json`
is located, and run `yarn <SCRIPT_NAME>`. Where `<SCRIPT_NAME>` is the name of the
script you wish to run.

### build

```sh
yarn dev
```

Runs [Webpack](https://webpack.github.io/) to builds the core JavaScript and CSS files in development mode.
This is faster than `yarn build` below and outputs the files in a format that is useful for debugging.

```sh
yarn watch
```

The same as `yarn dev`, except it will automatically rebuild whenever you change a `.js` or `.scss` file.
This is useful for when you are rapidly making lots of small changes.

```sh
yarn build
```

Runs [Webpack](https://webpack.github.io/) to builds the core JavaScript and CSS files in production mode.
You will need to run this script before committing your changes to git.

### build JavaScript or CSS separately

If you are only working on JavaScript or only working on CSS you might want to only build what you're working on. You can do this by adding `WEBPACK_CHILD=css` or `WEBPACK_CHILD=js` before the relevant yarn command, for example:

```sh
WEBPACK_CHILD=css yarn dev
```

The `css` or `js` portion of this is defined in the `webpack.config.js` file. Some modules may also include other configured components that can be built independently as well.

### lint

```sh
yarn lint
```

Run linters (`eslint` and `sass-lint`) to enforce
our [JavaScript](/contributing/javascript_coding_conventions) and
[CSS](/contributing/css_coding_conventions) coding conventions.

### test

```sh
yarn test
```

Runs the JavaScript unit tests.

### coverage

```sh
yarn coverage
```

Generates a coverage report for the JavaScript unit tests. The report is generated
in the `coverage` directory.

## Requiring Silverstripe JavaScript modules in your own CMS customisation

Silverstripe creates bundles which contain many dependencies you might also
want to use in your own CMS customisation (e.g. `react`).
You might also need some of SilverStripe's own JavaScript ECMA modules (e.g. `components/FormBuilder`).

To avoid transpiling these into your own generated bundles,
we have exposed many libraries as [Webpack externals](https://webpack.js.org/configuration/externals/).
This helps to keep the file size of your own bundle small, and avoids
execution issues with multiple versions of the same library.

In order to find out which libraries are exposed, check the `js/externals.js` file in [@silverstripe/webpack-config](https://www.npmjs.com/package/@silverstripe/webpack-config).

A shortened `webpack.config.js` in your own module could look as follows:

```js
module.exports = {
  entry: {
    'bundle': `mymodule/client/src/js/bundle.js`,
  },
  output: {
    path: './client/dist',
    filename: 'js/[name].js',
  },
  externals: {
    'components/FormBuilder/FormBuilder': 'FormBuilder',
    jQuery: 'jQuery',
    react: 'react',
  }
};
```

Now you can use the following statements in your own code without including those dependencies in your generated bundle:

```js
import react from 'react';
import jQuery from 'jQuery';
import FormBuilder from 'components/FormBuilder/FormBuilder';
```

For a more in-depth explanation of how to use `@silverstripe/webpack-config` [take a look at the readme](https://www.npmjs.com/package/@silverstripe/webpack-config).

## Publishing frontend packages to NPM

We're progressing to include NPM modules in our development process. We currently have a limited number of
[JavaScript only projects published to NPM under the `@silverstripe` organisation](https://www.npmjs.com/search?q=%40silverstripe).

When a pull request is merged against one of those JS-only projects, a new release has to be published to NPM. Regular
Silverstripe CMS modules using these packages have to upgrade their JS dependencies to get the new release.

These are the steps involved to publish a new version to NPM for a package, similar steps apply for creating a new
package under the `@silverstripe` organisation:

1) Make your changes, pull from upstream if applicable
2) Change to the relevant container folder with the `package.json` file
3) Run `npm login` and make sure you’re part of the `@silverstripe` organisation
4) Make sure the `name` property of the `package.json` file matches to the right module name with organisation name prefix, e.g. `"name": "@silverstripe/webpack-config"`
5) Update the `version` property of the `package.json` file with a new version number, following semantic versioning where possible
6) Run `npm version` and validate that the version matches what you expect
7) Run `npm publish`

_IMPORTANT NOTE_: You cannot publish the same or lower version number. Only members of the Silverstripe CMS core team
can publish a release to NPM.
