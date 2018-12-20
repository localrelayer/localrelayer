// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import * as webSelectors from 'web-selectors';
import {
  uiActions,
} from 'web-actions';
import Component from 'web-components/ConnectComponent';
import OrderBook from 'web-components/OrderBook';


const OrderBookContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      asks: webSelectors.getAskOrdersWithBar(state),
      bids: webSelectors.getBidOrdersWithBar(state),
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
