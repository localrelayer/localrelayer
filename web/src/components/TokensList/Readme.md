Examples:

```js { "props": { "className": "example-wrapper" } }
const { generateTestTokens } = require('../../utils/mocks');

  <div>
    <TokensList tokens={generateTestTokens()} onClick={(record) => console.log(record)} />
  </div>
```
