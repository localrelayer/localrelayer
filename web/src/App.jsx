// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import { Layout, Row, Col } from 'antd';

import BuySell from './containers/BuySellContainer';
import OrderBook from './containers/OrderBookContainer';
import TradingHistory from './containers/TradingHistoryContainer';
import UserBalance from './containers/UserBalanceContainer';
import UserOrders from './containers/UserOrdersContainer';
import TradingChart from './containers/TradingChartContainer';
import TokenCard from './containers/TokenCardContainer';
import Header from './containers/HeaderContainer';

const App: StatelessFunctionalComponent<*> = (): Node => (
  <Layout>
    <Header />
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
    </Layout>
  </Layout>
);

export default App;
