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
      <BuySell />
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
