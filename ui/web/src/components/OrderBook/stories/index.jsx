import React from 'react';
import BigNumber from 'bignumber.js';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import {
  coreMocks,
} from 'instex-core';

import TradingPageLayout from 'web-components/TradingPageLayout';
import 'web-styles/main.less';
import OrderBook from '..';


const baseAssetData = '0xe41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const quoteAssetData = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */

const orderSelector = ({ order }) => ({
  id: order.signature,
  price: (
    BigNumber(order.takerAssetAmount)
    / BigNumber(order.makerAssetAmount)
  ).toFixed(8),
  amount: order.makerAssetAmount,
  total: order.takerAssetAmount,
  ...order,
});

const api = coreMocks.mocksOrdersFactory({
  assetDataA: baseAssetData,
  assetDataB: quoteAssetData,
  qty: {
    bids: 15,
    asks: 15,
  },
});

const allOrders = api.getOrderBook({
  baseAssetData,
  quoteAssetData,
});

const asks = allOrders.asks.records.map(orderSelector);
const bids = allOrders.bids.records.map(orderSelector);

const OrderBookStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    orderBook={(
      <OrderBook
        asks={asks}
        bids={bids}
      />
    )}
  />
);

storiesOf('Components|OrderBook', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    OrderBookStory,
  ).add(
    'full screen',
    OrderBookStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
