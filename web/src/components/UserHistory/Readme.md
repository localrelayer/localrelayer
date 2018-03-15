Examples:

```js { "props": { "className": "example-wrapper" } }
const {
 generateTestOrders,
 tokensMock,
} = require('instex-core');

<div>
  <UserOrders
    orders={
      generateTestOrders(tokensMock[0].id)
        .map(order => ({ ...order, tokenSymbol: tokensMock[0].symbol }))
    }
    onCancel={(record) => console.warn('Canceling', record)} />
</div>
```
