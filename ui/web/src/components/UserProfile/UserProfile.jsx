import React from 'react';

import UserProfileLayout from 'web-components/UserProfileLayout';
import UserBalance from 'web-components/UserBalance';
import UserTradingHistory from 'web-components/UserTradingHistory';
import UserOrders from 'web-components/UserOrders';

const UserProfile = () => (
  <div>
    <UserProfileLayout>
      <div key="userBalance">
        <UserBalance />
      </div>
      <div key="userTradingHistory">
        <UserTradingHistory />
      </div>
      <div key="userOrders">
        <UserOrders />
      </div>
    </UserProfileLayout>
  </div>
);

export default UserProfile;
