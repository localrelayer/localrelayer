Examples:

```js { "props": { "className": "example-wrapper" } }
const {
 generateTestOrders,
 tokensMock,
} = require('instex-core');

<div>
  <OrderBook
    buyOrders={generateTestOrders(tokensMock[0].id)}
    sellOrders={generateTestOrders(tokensMock[1].id)}
  />
</div>
```
