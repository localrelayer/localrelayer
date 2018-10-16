import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import TradingChartContainer from '..';


const TradingHistoChartinerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tradingChart={(
      <TradingChartContainer />
    )}
  />
);

storiesOf('Containers|TradingChartContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    TradingHistoChartinerStory,
  )
  .add(
    'full screen',
    TradingHistoChartinerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
