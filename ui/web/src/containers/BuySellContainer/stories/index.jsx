import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import BuySellContainer from '..';


const BuySellContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    buySell={(
      <BuySellContainer />
    )}
  />
);

storiesOf('Containers|BuySellContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    BuySellContainerStory,
  )
  .add(
    'full screen',
    BuySellContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
