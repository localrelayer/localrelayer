// @flow
import React from 'react';
import {
  BigNumber,
} from '0x.js';
import type {
  Node,
} from 'react';

import * as webSelectors from 'web-selectors';
import {
  coreSelectors,
  coreActions,
} from 'localrelayer-core';
import {
  uiActions,
} from 'web-actions';
import Component from 'web-components/ConnectComponent';
import OrderBook from 'web-components/OrderBook';


/* Capitalize firts letter */
function cfl(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const OrderBookContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      asks: webSelectors.getAskOrdersFormatted(state),
      bids: webSelectors.getBidOrdersFormatted(state),
      tokenMarketPrice: coreSelectors.getTokenPrice()(state),
      assetPair: webSelectors.getCurrentAssetPair(state),
    })}
  >
    {({
      asks,
      bids,
      tokenMarketPrice,
      dispatch,
      assetPair,
    }) => (
      <OrderBook
        asks={asks}
        bids={bids}
        assetPair={assetPair}
        tokenMarketPrice={tokenMarketPrice}
        onFillClick={(order) => {
          dispatch(coreActions.fillOrderRequest({
            order,
            ordersToFill: [order],
            makerAssetFillAmounts: [
              new BigNumber(order.metaData.remainingFillableMakerAssetAmount),
            ],
            takerAssetFillAmounts: [
              new BigNumber(order.metaData.remainingFillableTakerAssetAmount),
            ],
          }));
        }}
        onOrderClick={(orderId, type) => {
          dispatch(uiActions.setUiState({
            currentOrderId: orderId,
            currentMarketLimitTab: 'limit',
          }));
          dispatch(uiActions.setUiState({
            currentOrderId: orderId,
            currentBuySellTab: `limit${cfl(type)}`,
          }));
        }}
      />
    )}
  </Component>
);

export default OrderBookContainer;
