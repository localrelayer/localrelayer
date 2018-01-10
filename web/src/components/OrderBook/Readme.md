Examples:

```js { "props": { "className": "example-wrapper" } }
const times = require('ramda').times;

const generateOrders = key => ({
  key,
  price: Math.random().toFixed(4),
  amount: Math.random().toFixed(4),
  total: (Math.random() * 5).toFixed(4),
});

  <div>
    <OrderBook buyOrders={times(generateOrders, 25)} sellOrders={times(generateOrders, 25)} />
  </div>
```
