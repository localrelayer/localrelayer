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
      <BuySellContainer key="buySell" />
      <UserBalanceContainer isTradingPage key="userBalance" />
      <OrderBookHistory key="orderBook" />
      <AssetPairCardContainer key="assetPairCard" />
      <TradingChartContainer key="tradingChart" />
      <UserOpenOrdersContainer key="userOpenOrders" />
    </TradingPageLayout>
  </div>
);
