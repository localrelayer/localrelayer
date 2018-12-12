// @flow
import React from 'react';
import type {
  Node,
} from 'react';

import {
  coreSelectors,
} from 'instex-core';
import Component from 'web-components/ConnectComponent';
import TradingHistory from 'web-components/TradingHistory';

const UserTradingHistoryContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: coreSelectors.getTradingHistory('userTradingHistory')(state),
    })}
  >
    {({ orders }) => (
      <TradingHistory
        orders={orders}
      />
    )}
  </Component>
);

export default UserTradingHistoryContainer;
