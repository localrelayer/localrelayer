Examples:

```js { "props": { "className": "example-wrapper" } }
  const {
   testUser,
  } = require('../../utils/mocks');
  const {
   tokensMock,
  } = require('instex-core');

  <div>
    <Header
      onUserClick={(user) => console.log(user)}
      user={testUser}
      tokens={tokensMock}
      selectedToken={state.selectedToken || {}}
      tokenPair={state.tokenPair || {}}
      onTokenSelect={record => setState({ selectedToken: record })}
      onPairSelect={record => setState({ tokenPair: record })}
    />
  </div>
```
