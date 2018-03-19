Examples:

```js { "props": { "className": "example-wrapper" } }
  const { testTokens } = require('../../utils/mocks');
  const { Provider } = require('react-redux');
  const store = require('../../store').default;

  <div>
    <Provider store={store}>
      <UserBalance
        tokens={testTokens}
        onTokenClick={(...props) => console.log(...props)}
        onToggle={(token) => console.log(token)}
      />
    </Provider>
  </div>
```
