import React from 'react';
import {
  Layout,
  Row,
  Col,
} from 'antd';

import BuySell from './BuySellContainer';
import OrderBook from './OrderBookContainer';
import TradingHistory from './TradingHistoryContainer';
import UserBalance from './UserBalanceContainer';
import UserOrders from './UserOrdersContainer';
import TradingChart from './TradingChartContainer';
import TokenCard from './TokenCardContainer';

export default () =>
  <Layout>
    <Row>
      <Col span={7}>
        <TokenCard />
        <BuySell />
        <UserBalance />
      </Col>
      <Col span={12}>
        <TradingChart />
        <OrderBook />
      </Col>
      <Col span={5}>
        <TradingHistory />
      </Col>
    </Row>
    <Row>
      <UserOrders />
    </Row>
  </Layout>;
