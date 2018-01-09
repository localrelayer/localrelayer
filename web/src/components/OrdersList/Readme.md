Examples:

```js { "props": { "className": "example-wrapper" } }
const times = require('ramda').times;

const generateTestData = key => ({
  key,
  price: '0.00005',
  amount: '4330.00',
  total: '0.2165',
});

  <div>
    <OrdersList data={times(generateTestData, 50)} />
    <OrdersList data={times(generateTestData, 3)}/>
    <OrdersList />
  </div>
```
