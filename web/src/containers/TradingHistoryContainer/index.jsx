import React from 'react';
import TradingHistory from '../../components/TradingHistory';
import { generateTestOrders } from '../../utils/mocks';

export default () => (
  <TradingHistory
    orders={generateTestOrders()}
    onClick={record => console.log(record)}
    pagination={{ pageSize: 15 }}
  />
);
