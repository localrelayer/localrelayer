import React from 'react';

import UserProfilePageLayout from 'web-components/UserProfilePageLayout';
import UserBalanceContainer from 'web-containers/UserBalanceContainer';
import TradingHistoryContainer from 'web-containers/TradingHistoryContainer';
import UserOpenOrdersContainer from 'web-containers/UserOpenOrdersContainer';
import HeaderContainer from 'web-containers/HeaderContainer';


const UserProfilePageContainer = () => (
  <div>
    <HeaderContainer />
    <UserProfilePageLayout>
      <UserBalanceContainer isTradingPage={false} key="userBalance" />
      <TradingHistoryContainer isTradingPage={false} isUserTradingHistory key="tradingHistory" />
      <UserOpenOrdersContainer key="userOpenOrders" />
    </UserProfilePageLayout>
  </div>
);

export default UserProfilePageContainer;
