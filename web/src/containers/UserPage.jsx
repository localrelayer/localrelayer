import React from 'react';
import {
  Row,
  Col,
} from 'antd';

import UserBalance from './UserBalanceContainer';
import UserOrders from './UserOrdersContainer';
import UserHistory from './UserHistoryContainer';

export default () =>
  <Row>
    <Col span={12}>
      <UserBalance />
    </Col>
    <Col span={12}>
      <UserOrders />
      <UserHistory />
    </Col>
  </Row>;
