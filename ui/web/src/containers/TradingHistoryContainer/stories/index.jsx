import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import TradingHistoryContainer from '..';


const TradingHistoryContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tradingHistory={(
      <TradingHistoryContainer />
    )}
  />
);

storiesOf('Containers|TradingHistoryContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    TradingHistoryContainerStory,
  )
  .add(
    'full screen',
    TradingHistoryContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
