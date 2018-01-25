Examples:

```js { "props": { "className": "example-wrapper" } }
  const {
   tokensMock,
  } = require('instex-core');


  <div>
    <TokensList
      tokens={tokensMock}
      selectedToken={state.selectedToken || {}}
      tokenPair={state.tokenPair || {}}
      onPairSelect={record => setState({ tokenPair: record })}
      onSelect={record => setState({ selectedTokenId: record.id })}
      onSearch={value => console.log(value)}
    />
  </div>
```
