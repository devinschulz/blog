---
title: Modify Create React App's Babel Configuration Without Ejecting
date: 2020-02-02
description:
  Learn how to modify the underlying Create React App configuration with
  customize-cra to include new babel plugins. All without having to eject.
tags: [React, Babel]
---

I love using [Create React App](https://github.com/facebook/create-react-app) to
spin up an application swiftly, but one annoyance I continuously run into is the
lack of ability to modify the Babel configuration. Why would you want to do
this? Perhaps you want to use some of the latest ES.next features before they're
approved and merged into Create React App. In this case, you may
[eject](https://create-react-app.dev/docs/available-scripts/#npm-run-eject) the
app, but there are several reasons why you don't want to do that.

<!--more-->

For this article, we're going to add both the nullish coalescing operator and
optional chaining syntax babel plugins. These plugins are both excluded from
Create React App at the time of writing.

Begin by firing up your terminal and installing Create React App with the
following command:

```shell
npx create-react-app my-app
cd my-app
```

The first step may take a while to complete depending on your internet
connection. If you do not have `npx` installed, run `npm install --global npx`
or `yarn global add npx` and then try the previous step again. We need two
separate packages to override the configuration, `customize-cra` and
`react-app-rewired`. We're not calling `react-app-rewired` directly, but it's a
required dependency of `customize-cra`.

```shell
npm i -D customize-cra react-app-rewired
```

Open `package.json` in your editor of choice and replace all references to
`react-scripts` under the `scripts` property with `react-app-rewired`. Once
complete, your `scripts` should look like this:

```json
"scripts": {
 "start": "react-app-rewired start",
 "build": "react-app-rewired build",
 "test": "react-app-rewired test"
}
```

Create a new file called `config-overrides.js` in the project root directory.

```shell
touch config-overrides.js
```

`customize-cra` has various utility functions you can use to configure virtually
all aspects of the babel and Webpack config. In our case, `addBabelPlugins` is
what we need to add both plugins.

Open `config-overrides.js` and add the following:

```js
const {override, addBabelPlugins} = require('customize-cra')

module.exports = override(
  addBabelPlugins(
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-optional-chaining',
  ),
)
```

For both of the plugins to work correctly, we'll need to install the packages.

```shell
npm i -D @babel/plugin-proposal-nullish-coalescing-operator @babel/plugin-syntax-optional-chaining
```

You can now test this all works by running `npm start` in your terminal. Open
`src/App.js`, remove all the boilerplate code and add an expression to verify
babel is transpiling the bundle correctly.

```js
import React from 'react'

export default function App() {
  const obj = {}
  const prop = obj.foo?.bar?.() ?? 'foo bar'
  return <div className="App">{prop}</div>
}
```

In this example, you should have no errors in the Webpack output, and `foo bar`
is rendered on the screen.
