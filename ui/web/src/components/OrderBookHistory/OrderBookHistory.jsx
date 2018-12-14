// @flow
import React from 'react';

import type {
  Node,
} from 'react';
import OrderBookContainer from 'web-containers/OrderBookContainer';
import TradingHistoryContainer from 'web-containers/TradingHistoryContainer';
import * as S from './styled';

const OrderBookHistory = (): Node => (
  <S.Tabs animated={false} defaultActiveKey="1">
    <S.TabPane tab="OrderBook" key="1">
      <OrderBookContainer />
    </S.TabPane>
    <S.TabPane tab="Trading History" key="2">
      <TradingHistoryContainer isTradingPage />
    </S.TabPane>
  </S.Tabs>
);

export default OrderBookHistory;
