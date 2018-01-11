Examples:

```js { "props": { "className": "example-wrapper" } }
const times = require('ramda').times;
const { generateTestOrders } = require('../../utils/mocks');

  <div>
    <OrderBook
      buyOrders={times(generateTestOrders, 25)}
      sellOrders={times(generateTestOrders, 25)}
      onClick={(record) => console.log(record)}
    />
  </div>
```