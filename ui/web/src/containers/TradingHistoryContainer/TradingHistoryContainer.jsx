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

type Props = {
  isTradingPage: Boolean,
  isUserTradingHistory: Boolean,
};

const TradingHistoryContainer = ({
  isTradingPage,
  isUserTradingHistory,
}: Props): Node => (
  <Component
    mapStateToProps={state => ({
      orders: isUserTradingHistory
        ? coreSelectors.getTradingHistory('userTradingHistory')(state)
        : coreSelectors.getTradingHistory('tradingHistory')(state),
    })}
  >
    {({ orders }) => (
      <TradingHistory
        isTradingPage={isTradingPage}
        isUserTradingHistory={isUserTradingHistory}
        orders={orders}
      />
    )}
  </Component>
);

export default TradingHistoryContainer;
