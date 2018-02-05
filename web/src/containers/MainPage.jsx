import React from 'react';
import {
  Layout,
} from 'antd';

import Header from './HeaderContainer';
import TradingPage from './TradingPage';

export default () =>
  <Layout>
    <Header />
    <TradingPage />
  </Layout>;
