Examples:

```js { "props": { "className": "example-wrapper" } }
const { Provider } = require('react-redux');

const store = require('../../store').default;

<Provider store={store}>
  <BuySell />
</Provider>
```
