Examples:

```js { "props": { "className": "example-wrapper" } }
const {
 generateTestOrders,
 tokensMock,
} = require('instex-core');


<div>
  <TradingHistory
    orders={generateTestOrders(tokensMock[0].id)}
  />
</div>
```
