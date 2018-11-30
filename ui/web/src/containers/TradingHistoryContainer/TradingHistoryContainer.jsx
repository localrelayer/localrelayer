// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getTradingHistory,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import TradingHistory from 'web-components/TradingHistory';


const TradingHistoryContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: getTradingHistory(state),
    })}
  >
    {({ orders }) => (
      <TradingHistory
        isTradingPage
        orders={orders}
      />
    )}
  </Component>
);

export default TradingHistoryContainer;
