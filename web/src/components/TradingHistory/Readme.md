Examples:

```js { "props": { "className": "example-wrapper" } }
const { generateTestOrders } = require('../../utils/mocks');

  <div>
    <TradingHistory orders={generateTestOrders()} onClick={(record) => console.log(record)} />
  </div>
```
