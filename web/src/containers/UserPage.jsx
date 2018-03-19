import React from 'react';
import {
  Row,
  Col,
} from 'antd';

import UserTotalBalance from './UserTotalBalanceContainer';
import UserOrders from './UserOrdersContainer';
import UserHistory from './UserHistoryContainer';

export default () =>
  <Row>
    <Col span={12}>
      <UserTotalBalance />
    </Col>
    <Col span={12}>
      <UserOrders />
      <UserHistory />
    </Col>
  </Row>;
