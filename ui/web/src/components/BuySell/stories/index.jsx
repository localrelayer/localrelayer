import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';
import TradingPageLayout from 'web-components/TradingPageLayout';
import 'web-styles/main.less';
import BuySell from '..';


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

const BuySellStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    buySell={(
      <BuySell
        currentAssetPair={assetPair}
        onSubmitOrder={({ formActions }) => {
          console.log('onSubmitOrder');
          setTimeout(() => {
            formActions.resetForm({});
            formActions.setSubmitting(false);
          }, 1000);
        }}
      />
    )}
  />
);

storiesOf('Components|BuySell', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    BuySellStory,
  )
  .add(
    'full screen',
    BuySellStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
