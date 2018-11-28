// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors as cs,
} from 'instex-core';
import {
  uiActions,
} from 'web-actions';
import Component from 'web-components/ConnectComponent';
import OrderBook from 'web-components/OrderBook';


const OrderBookContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      asks: cs.getAskOrders(state),
      bids: cs.getBidOrders(state),
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
