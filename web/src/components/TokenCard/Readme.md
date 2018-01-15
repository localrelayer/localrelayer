Examples:

```js { "props": { "className": "example-wrapper" } }
  const { getTestToken } = require('../../utils/mocks');

  <div>
    <TokenCard token={getTestToken()} onClick={() => console.log('test')} />
  </div>
```
