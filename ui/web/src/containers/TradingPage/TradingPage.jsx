import React from 'react';

import TradingPageLayout from 'web-components/TradingPageLayout';
import HeaderContainer from 'web-containers/HeaderContainer';
import OrderBookContainer from 'web-containers/OrderBookContainer';
import AssetPairCardContainer from 'web-containers/AssetPairCardContainer';
import BuySellContainer from 'web-containers/BuySellContainer';
import UserBalanceContainer from 'web-containers/UserBalanceContainer';
import UserOrdersContainer from 'web-containers/UserOrdersContainer';
import TradingHistoryContainer from 'web-containers/TradingHistoryContainer';


export default () => (
  <div>
    <HeaderContainer />
    <TradingPageLayout>
      <div key="assetPairCard">
        <AssetPairCardContainer />
      </div>
      <TradingPageLayout.DottedBorder key="chart">
        Chart
      </TradingPageLayout.DottedBorder>
      <div key="userBalance">
        <UserBalanceContainer />
      </div>
      <div key="orderBook">
        <OrderBookContainer />
      </div>
      <div key="buySell">
        <BuySellContainer />
      </div>
      <div key="userOrders">
        <UserOrdersContainer />
      </div>
      <div key="tradingHistory">
        <TradingHistoryContainer />
      </div>
    </TradingPageLayout>
  </div>
);
