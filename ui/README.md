# Local Relayer UI

## State architecture
This architecure based on [redux](http://redux.js.org/), so for deeply understanding just read it.

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

#### Chart

At the moment LocalRelayer uses TradingView as charting library. TradingView is free to use but requires licence.
If you want to run local version with chart you need to get [licence](https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library). After receiving access, put charting_library folder here /ui/web/dist/ and add this to the bottom if index.tpl.html file
```
<script defer type="text/javascript" src="charting_library/charting_library.min.js"></script>
```

*We are considering changing to open-source alternative (https://github.com/tradingview/lightweight-charts or https://github.com/rrag/react-stockcharts). Stay updated.*

#### Installation

```js
  yarn
  yarn bootstrap
```

#### Running dev server

```js
  cd web
  yarn start
```

#### Testing (needs fixing)

```js
  cd web
  yarn test
```

#### Linting (needs fixing)

```js
  cd web
  yarn lint
```

#### Storybook (needs fixing)

```js
  cd web
  yarn storybook
```
