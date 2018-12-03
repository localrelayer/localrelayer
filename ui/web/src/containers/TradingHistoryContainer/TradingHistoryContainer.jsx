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


const TradingHistoryContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: coreSelectors.getTradingHistory(state),
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
