import React from 'react';
import {
  storiesOf,
} from '@storybook/react';

import TradingPageLayout from 'web-components/TradingPageLayout';
import AssetPairCard from '..';

const assetPair = {
  id: '0xe41d2489571d322189246dafa5ebde1f4699f498_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  assetDataA: {
    minAmount: '0',
    maxAmount: '10000000000000000000',
    precision: 5,
    assetData: {
      symbol: 'ZRX',
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
    },
  },
  assetDataB: {
    minAmount: '0',
    maxAmount: '50000000000000000000',
    precision: 5,
    assetData: {
      symbol: 'WETH',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
  },
  meta: {
    tradingInfo: {
      volume: '10001',
      change24Hour: -50,
      lastPrice: '5',
      highPrice: '10',
      lowPrice: '5',
    },
  },
};

storiesOf('AssetPairCard', module)
  .add('with Layout', () => (
    <TradingPageLayout.Preview
      assetPairCard={(
        <AssetPairCard
          assetPair={assetPair}
        />
      )}
    />
  ))
  .add('hide rest components', () => (
    <TradingPageLayout.Preview
      hideRest
      assetPairCard={(
        <AssetPairCard
          assetPair={assetPair}
        />
      )}
    />
  ));
