// @flow
import React from 'react';

import type {
  Node,
} from 'react';

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
      asks: coreSelectors.getAskOrders(state),
      bids: coreSelectors.getBidOrders(state),
    })}
  >
    {({
      asks,
      bids,
      dispatch,
    }) => (
      <OrderBook
        asks={asks}
        bids={bids}
        onOrderClick={(orderId, type) => dispatch(uiActions.setUiState({
          currentOrderId: orderId,
          currentBuySellTab: type,
        }))}
      />
    )}
  </Component>
);

export default OrderBookContainer;
