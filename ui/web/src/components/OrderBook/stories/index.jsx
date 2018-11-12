import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';
import {
  BigNumber,
} from '0x.js';
import {
  coreMocks,
} from 'instex-core';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

import TradingPageLayout from 'web-components/TradingPageLayout';
import 'web-styles/main.less';
import OrderBook from '..';


const baseAssetData = '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498'; /* ZRX */
const quoteAssetData = '0xf47261b0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; /* WETH */

const orderSelector = ({ order }) => ({
  id: order.signature,
  price: new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount).toFixed(8),
  amount: Web3Wrapper.toUnitAmount(
    new BigNumber(order.makerAssetAmount), 18,
  ).toFixed(8),
  total: Web3Wrapper.toUnitAmount(
    new BigNumber(order.takerAssetAmount), 18,
  ).toFixed(8),
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
