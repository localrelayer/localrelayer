import React from 'react';

import UserProfileLayout from 'web-components/UserProfileLayout';
import UserBalanceContainer from 'web-containers/UserBalanceContainer';
import UserTradingHistoryContainer from 'web-containers/UserTradingHistoryContainer';
import UserOrdersContainer from 'web-containers/UserOrdersContainer';
import HeaderContainer from 'web-containers/HeaderContainer';


const UserProfilePageContainer = () => (
  <div>
    <HeaderContainer />
    <UserProfileLayout>
      <div key="userBalance">
        <UserBalanceContainer isTradingPage={false} />
      </div>
      <div key="userTradingHistory">
        <UserTradingHistoryContainer />
      </div>
      <div key="userOrders">
        <UserOrdersContainer />
      </div>
    </UserProfileLayout>
  </div>
);

export default UserProfilePageContainer;
