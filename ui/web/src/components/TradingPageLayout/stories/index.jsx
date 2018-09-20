import React from 'react';
import {
  storiesOf,
} from '@storybook/react';

import TradingPageLayout from '..';
import {
  DottedBorder,
} from '../styled';

storiesOf('TradingPageLayout', module)
  .add('trading-page-layout-default', () => (
    <TradingPageLayout>
      <DottedBorder key="assetPairCard">
        AssetPairs
      </DottedBorder>

      <DottedBorder key="balance">
        Balance
      </DottedBorder>

      <DottedBorder key="userOrders">
        OpenedOrders
      </DottedBorder>

      <DottedBorder key="chart">
        Charts
      </DottedBorder>

      <DottedBorder key="orderBook">
        OrderBook
      </DottedBorder>

      <DottedBorder key="buySell">
        Buy/Sell
      </DottedBorder>

      <DottedBorder key="history">
        TradingHistory
      </DottedBorder>

      <DottedBorder key="news">
          News
      </DottedBorder>
    </TradingPageLayout>
  ));
