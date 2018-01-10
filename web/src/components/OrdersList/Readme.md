Examples:

```js { "props": { "className": "example-wrapper" } }
const times = require('ramda').times;

const columns = [
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
  ];

const generateTestData = key => ({
  key,
  price: '0.00005',
  amount: '4330.00',
  total: '0.2165',
});
  <div>
    <OrdersList title="Test Title" data={times(generateTestData, 50)} columns={columns} />
    <OrdersList data={times(generateTestData, 3)} columns={columns} />
    <OrdersList title="Table with no data" />
  </div>
```
