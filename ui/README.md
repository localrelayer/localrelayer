# Instex-ui

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
