Examples:

```js { "props": { "className": "example-wrapper" } }
  const { testTokens } = require('../../utils/mocks');

  <div>
    <UserBalance tokens={testTokens} onTokenClick={(...props) => console.log(...props)} onToggle={(token) => console.log(token)} />
  </div>
```
