Examples:

```js { "props": { "className": "example-wrapper" } }
const { generateTestOrders } = require('../../utils/mocks');

  <div>
    <OrderBook
      buyOrders={generateTestOrders()}
      sellOrders={generateTestOrders()}
      onClick={(record) => console.log(record)}
    />
  </div>
```
