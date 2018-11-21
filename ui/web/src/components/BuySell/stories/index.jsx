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

const BuySellStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    buySell={(
      <BuySell
        balance={
          {
            '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c': 9999990000000000000000000,
            '0x0b1ba0af832d7c05fd64161e0db78e85978e8082': 20200000000000000000,
          }
        }
        currentPairSymbols={
          {
            base: {
              assetAddress: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
              symbol: 'ZRX',
            },
            quote: {
              assetAddress: '0x0b1ba0af832d7c05fd64161e0db78e85978e8082',
              symbol: 'WETH',
            },
          }
        }
        onSubmitOrder={() => {}}
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
