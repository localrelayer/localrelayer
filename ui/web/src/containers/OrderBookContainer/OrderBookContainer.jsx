// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import * as webSelectors from 'web-selectors';
import {
  coreSelectors,
} from 'instex-core';
import {
  uiActions,
} from 'web-actions';
import Component from 'web-components/ConnectComponent';
import OrderBook from 'web-components/OrderBook';


const OrderBookContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      asks: webSelectors.getAskOrdersFormatted(state),
      bids: webSelectors.getBidOrdersFormatted(state),
      tokenMarketPrice: coreSelectors.getTokenPrice()(state),
    })}
  >
    {({
      asks,
      bids,
      tokenMarketPrice,
      dispatch,
    }) => (
      <OrderBook
        asks={asks}
        bids={bids}
        tokenMarketPrice={tokenMarketPrice}
        onOrderClick={(orderId, type) => dispatch(uiActions.setUiState({
          currentOrderId: orderId,
          currentBuySellTab: type,
        }))}
      />
    )}
  </Component>
);

export default OrderBookContainer;
