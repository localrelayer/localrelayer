// @flow
import React from 'react';
import type {
  Node,
} from 'react';
import UserOpenOrdersContainer from 'web-containers/UserOpenOrdersContainer';
import TradingHistoryContainer from 'web-containers/TradingHistoryContainer';
import * as S from './styled';

const UserOrdersContainer = (): Node => (
  <S.UserOrdersTabs
    animated={false}
    defaultActiveKey="1"
    size="small"
  >
    <S.UserOrdersTabs.TabPane tab="Open" key="1">
      <UserOpenOrdersContainer isTradingPage />
    </S.UserOrdersTabs.TabPane>
    <S.UserOrdersTabs.TabPane tab="Filled" key="2">
      <TradingHistoryContainer isUserTradingHistory />
    </S.UserOrdersTabs.TabPane>
  </S.UserOrdersTabs>
);

export default UserOrdersContainer;
