// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors as cs,
} from 'instex-core';
import Component from 'web-components/ConnectComponent';
import TradingHistory from 'web-components/TradingHistory';


const TradingHistoryContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: cs.getOrdersHistoryMock(state),
    })}
  >
    {({ orders }) => (
      <TradingHistory
        orders={orders}
      />
    )}
  </Component>
);

export default TradingHistoryContainer;
