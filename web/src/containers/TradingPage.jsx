import React from 'react';
import {
  Layout,
  Row,
  Col,
} from 'antd';
import MediaQuery from 'react-responsive';

import BuySell from './BuySellContainer';
import OrderBook from './OrderBookContainer';
import TradingHistory from './TradingHistoryContainer';
import UserBalance from './UserBalanceContainer';
import UserOrders from './UserOrdersContainer';
import TradingChart from './TradingChartContainer';
import TokenCard from './TokenCardContainer';

export default () =>
  <Layout>
    <MediaQuery maxDeviceWidth={1800}>
      <Row>
        <Col span={7}>
          <TokenCard />
          <UserBalance />
          <UserOrders />
        </Col>
        <Col span={11}>
          <TradingChart />
          <OrderBook />
        </Col>
        <Col span={6}>
          <BuySell />
          <TradingHistory />
        </Col>
      </Row>
    </MediaQuery>
    <MediaQuery minDeviceWidth={1801} maxDeviceWidth={2100}>
      <Row>
        <Col span={5}>
          <TokenCard />
          <UserBalance />
          <UserOrders />
        </Col>
        <Col span={14}>
          <TradingChart />
          <OrderBook />
        </Col>
        <Col span={5}>
          <BuySell />
          <TradingHistory />
        </Col>
      </Row>
    </MediaQuery>
    <MediaQuery minDeviceWidth={2101}>
      <Row>
        <Col span={4}>
          <TokenCard />
          <UserBalance />
          <UserOrders />
        </Col>
        <Col span={16}>
          <TradingChart />
          <OrderBook />
        </Col>
        <Col span={4}>
          <BuySell />
          <TradingHistory />
        </Col>
      </Row>
    </MediaQuery>
  </Layout>;
