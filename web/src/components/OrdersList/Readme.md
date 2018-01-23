Examples:

```js { "props": { "className": "example-wrapper" } }
const {
 generateTestOrders,
 tokensMock,
} = require('instex-core');


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
    data={generateTestOrders(tokensMock[0].id)}
    columns={columns}
  />
  <OrdersList title="Table with no data" />
</div>
```
