// @flow
import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
  object,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import 'web-styles/main.less';
import AssetPairCard from '..';


const assetPair = {
  id: '0xe41d2489571d322189246dafa5ebde1f4699f498_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  assetDataA: {
    minAmount: '0',
    maxAmount: '10000000000000000000',
    precision: 5,
    assetData: {
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      name: '0x Protocol Token',
      symbol: 'ZRX',
      decimals: 18,
    },
  },
  assetDataB: {
    minAmount: '0',
    maxAmount: '50000000000000000000',
    precision: 5,
    assetData: {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
  },
  tradingInfo: {
    assetAVolume: '42.44000000',
    change24: '-99.50',
    lastPrice: '0.00250000',
    maxPrice: '0.50000000',
    minPrice: '0.00250000',
  },
};

type Props = {
  emptyInfo: boolean,
};

const AssetPairCardStory = ({ emptyInfo = false }: Props) => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    assetPairCard={(
      <AssetPairCard
        loading={boolean('Loading', false)}
        assetPair={(
          emptyInfo
            ? {}
            : object('assetPair', assetPair)
        )}
      />
    )}
  />
);

storiesOf('Components|AssetPairCard', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [AssetPairCard],
    },
  })
  .add(
    'default',
    () => (
      <AssetPairCardStory />
    ),
    {
      info: {
        text: `
          AssetPairCard component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'with empty info',
    () => (
      <AssetPairCardStory emptyInfo />
    ),
  )
  .add(
    'full screen',
    () => (
      <AssetPairCardStory />
    ),
    {
      options: {
        goFullScreen: true,
      },
    },
  );
