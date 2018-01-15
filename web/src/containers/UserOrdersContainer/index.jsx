import React from 'react';
import UserOrders from '../../components/UserOrders';
import { generateTestOrders } from '../../utils/mocks';

export default () => (
  <UserOrders
    orders={generateTestOrders()}
    onClick={record => console.log(record)}
    onCancel={record => console.warn('Canceling', record)}
  />
);
