import React from 'react';

import UserProfilePageLayout from 'web-components/UserProfilePageLayout';
import UserBalanceContainer from 'web-containers/UserBalanceContainer';
import UserTradingHistoryContainer from 'web-containers/UserTradingHistoryContainer';
import UserOpenOrdersContainer from 'web-containers/UserOpenOrdersContainer';
import HeaderContainer from 'web-containers/HeaderContainer';


const UserProfilePageContainer = () => (
  <div>
    <HeaderContainer />
    <UserProfilePageLayout>
      <div key="userBalance">
        <UserBalanceContainer isTradingPage={false} />
      </div>
      <div key="tradingHistory">
        <UserTradingHistoryContainer />
      </div>
      <div key="userOpenOrders">
        <UserOpenOrdersContainer />
      </div>
    </UserProfilePageLayout>
  </div>
);

export default UserProfilePageContainer;
