# instex
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)


## GitFlow
We use [Vincent Driessen's branching model.](http://nvie.com/posts/a-successful-git-branching-model/)  
Read details here:  
- http://nvie.com/posts/a-successful-git-branching-model/  
- https://www.atlassian.com/git/tutorials/comparing-workflows#gitflow-workflow  
- http://danielkummer.github.io/git-flow-cheatsheet/  

Use [git-flow](https://github.com/petervanderdoes/gitflow-avh) package for working with branches.

#### git flow init
Use all init settings as default, except tag prefix, it must be 'v'.
This is the styleguide for Instex: a set of UI components which are
used in development of the plugin

Every new feature should be developed in s separate branch using

```sh
  git-flow feature start <feature-name>
```

and then merged in develop using

```sh
  git-flow feature finish
```

## Commit changes

#### Conventional Commits
We use [conventional commits specification](https://conventionalcommits.org/) for commit messages.

#### Commitizen
To ensure that all commit messages are formatted correctly, we use [Commitizen](http://commitizen.github.io/cz-cli/) in this repository.
It provides interactive interface that creates your commit messages for you.
Running commitizen is as simple as running yarn commit from the root of the repo.
You can pass all the same flags you would normally use with git commit.

```
  yarn commit
```

When contributing, use this exact flow:

  1. `$ git-flow feature start <Jira issue key>`

  2. make changes

  3. `$ yarn commit`

  4. when work is done, squash all commits into one with commit message: `feat(<scope>): <jira issue summary>`

  5. `$ git-flow feature publish`

  6. open a pull request to `develop` branch

## State architecture
This architecure based on [redux documentation](http://redux.js.org/), so for deeply understanding just read it.

#### To keep clean project's architecture, use these principles:
* [Data normalizing](http://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html) is the most important thing that you have to use.
* [Simple reducer](http://redux.js.org/docs/recipes/reducers/UpdatingNormalizedData.html) 
* [Memorized selectors](https://github.com/reactjs/reselect)

## Flow
Don't forget to use a static type checker. Describe the types for all data used.

## Naming convention
Use airbnb naming conventions:  
- https://github.com/airbnb/javascript/tree/master/react#naming  
- https://github.com/airbnb/javascript#naming-conventions
#### Variables
Use declarative style and avoid single letter names.
If you use abbreveature leave comment with deciphering abbreviations.
#### Selectors
All selectors should have a 'get' prefix.
#### Actions
Actions must begin with some verb - set, fetch, fill, add, delete, etc...

## Containers and Components
* [Simple article about it](https://medium.com/@learnreact/container-components-c0e67432e005)
* [Dan Abramov about it](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

## Usage

#### Installation

##### Before you start
  + [node](https://nodejs.org/) version should be >= 8 `node -v`
  + [npm](https://www.npmjs.com/) version should be >= 5 `npm -v`
  + [yarn](https://yarnpkg.com/) should be installed globally

#### Installation

```js
  yarn
  yarn bootstrap
```

#### Running dev server(web)

```js
  yarn styleguide
```

#### Testing

```js
  yarn test
```

#### Linting

```js
  yarn lint
```
