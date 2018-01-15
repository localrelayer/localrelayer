import React from 'react';
import OrderBook from '../../components/OrderBook';
import { generateTestOrders } from '../../utils/mocks';

export default () => (
  <OrderBook
    buyOrders={generateTestOrders()}
    sellOrders={generateTestOrders()}
    onClick={record => console.log(record)}
  />
);
