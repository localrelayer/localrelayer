Examples:

```js { "props": { "className": "example-wrapper" } }
const times = require('ramda').times;
const { generateTestOrders } = require('../../utils/mocks');

  <div>
    <UserOrders orders={generateTestOrders()} onClick={(record) => console.log(record)} onCancel={(record) => console.warn('Canceling', record)} />
  </div>
```
