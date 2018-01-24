Examples:

```js { "props": { "className": "example-wrapper" } }
  const {
   tokensMock,
  } = require('instex-core');


  <div>
    <TokensList
      tokens={tokensMock}
      selectedTokenId={state.selectedTokenId}
      onSelect={record => setState({ selectedTokenId: record.id })}
      onSearch={value => console.log(value)}
    />
  </div>
```
