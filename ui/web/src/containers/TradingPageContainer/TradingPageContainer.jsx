import React from 'react';

import HeaderContainer from 'web-containers/HeaderContainer';
import TradingPageLayout from 'web-components/TradingPageLayout';
import OrderBookHistory from 'web-components/OrderBookHistory';
import AssetPairCardContainer from 'web-containers/AssetPairCardContainer';
import BuySellContainer from 'web-containers/BuySellContainer';
import UserBalanceContainer from 'web-containers/UserBalanceContainer';
import UserOpenOrdersContainer from 'web-containers/UserOpenOrdersContainer';
import TradingChartContainer from 'web-containers/TradingChartContainer';


export default () => (
  <div>
    <HeaderContainer />
    <TradingPageLayout>
      <div key="assetPairCard">
        <AssetPairCardContainer />
      </div>
      <div key="tradingChart">
        <TradingChartContainer />
      </div>
      <div key="userBalance">
        <UserBalanceContainer isTradingPage />
      </div>
      <div key="orderBook">
        <OrderBookHistory />
      </div>
      <div key="buySell">
        <BuySellContainer />
      </div>
      <div key="userOpenOrders">
        <UserOpenOrdersContainer />
      </div>
    </TradingPageLayout>
  </div>
);
