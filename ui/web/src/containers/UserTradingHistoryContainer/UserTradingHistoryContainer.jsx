// @flow
import React from 'react';
import type {
  Node,
} from 'react';
import {
  getTradingHistory,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import UserTradingHistory from 'web-components/UserTradingHistory';

const UserTradingHistoryContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: getTradingHistory(state),
    })}
  >
    {({ orders }) => (
      <UserTradingHistory
        orders={orders}
      />
    )}
  </Component>
);

export default UserTradingHistoryContainer;
