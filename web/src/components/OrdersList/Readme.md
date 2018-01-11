Examples:

```js { "props": { "className": "example-wrapper" } }
const times = require('ramda').times;
const { generateTestOrders } = require('../../utils/mocks');

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

  <div>
    <OrdersList
      title="Test Title"
      data={times(generateTestOrders, 50)}
      columns={columns}
      onClick={() => console.log('test')}
    />
    <OrdersList data={times(generateTestOrders, 3)} columns={columns} />
    <OrdersList title="Table with no data" />
  </div>
```
