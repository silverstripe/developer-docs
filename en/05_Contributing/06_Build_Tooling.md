---
title: Build tooling
summary: The tools we use to compile our client-side code
icon: tools
---

# Client-side build tooling

Core JavaScript, CSS, and thirdparty client-side dependencies are managed with the build tooling
described below.

Note this only applies to core Silverstripe CMS dependencies, you're free to manage
dependencies in your project codebase however you like.

## Installation

The [Node.js](https://nodejs.org) JavaScript runtime is the foundation of our client-side
build tool chain. If you want to do things like upgrade dependencies, make changes to core
JavaScript or SCSS files, you'll need Node installed on your dev environment.

We recommend using the
[Node Version Manager](https://github.com/creationix/nvm) (nvm) to ensure you use the appropriate
version of node.

If you're using nvm, make sure you use it to install and swap to the correct version of node
before you run any of the yarn commands.

```bash
nvm install && nvm use
```

[yarn](https://yarnpkg.com/) is the package manager we use for JavaScript dependencies.
You'll need to install yarn after Node.js is installed.
See [yarn installation docs](https://yarnpkg.com/en/docs/install).
We recommend using `npm` which comes with Node.js to install it globally.

```bash
npm install -g yarn
```

Once you've installed Node.js and yarn, run the following command once in the `silverstripe/admin` module folder and in each module folder you are working on:

```bash
yarn install
```

[notice]
The `silverstripe/admin` repository includes some components and dependencies that other modules
need to work. Make sure that in addition to the module(s) who's code you're touching, you also run
`yarn install` in the directory for `silverstripe/admin`.

You may need to first run `composer reinstall silverstripe/admin --prefer-source` if you installed
that module without `--prefer-source` originally.
[/notice]

## Build Commands

The `script` property of a `package.json` file can be used to define command line
[scripts](https://docs.npmjs.com/misc/scripts).

To run one of these scripts, open up your terminal, change to the directory where `package.json`
is located, and run `yarn <SCRIPT_NAME>`. Where `<SCRIPT_NAME>` is the name of the
script you wish to run.

### build

During development, you'll want to build the core JavaScript and CSS files in development mode.
This is faster than `yarn build` below and outputs the files in a format that is useful for debugging.

```bash
yarn dev
```

You might want to automatically rebuild whenever you change a `.js` or `.scss` file.
This is useful for when you are rapidly making lots of small changes.

```bash
yarn watch
```

When you've finished making your changes, build the core JavaScript and CSS files in production mode.
You will need to run this script before committing your changes to git.

```bash
yarn build
```

#### build JavaScript or CSS separately

If you are only working on JavaScript or only working on CSS you might want to only build what you're working on. You can do this by adding `WEBPACK_CHILD=css` or `WEBPACK_CHILD=js` before the relevant yarn command, for example:

```sh
WEBPACK_CHILD=css yarn dev
```

The `css` or `js` portion of this is defined in the `webpack.config.js` file. Some modules may also include other configured components that can be built independently as well.

### lint and test

You can lint and run JavaScript unit tests manually - though note that these are also automatically run as part of the `yarn build` script.
You will not be able to build production-ready distribution files if either of these fails.

```bash
yarn lint
yarn test
```

## Requiring Silverstripe CMS JavaScript modules in your own CMS customisation

Silverstripe CMS creates bundles which contain many dependencies you might also
want to use in your own CMS customisation (e.g. `react`).
You might also need some of Silverstripe CMS's own JavaScript components (e.g. `components/FormBuilder`).

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
