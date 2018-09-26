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
import TradingHistory from '..';


const TradingHistoryStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tradingHistory={(
      <TradingHistory orders={[]} />
    )}
  />
);


storiesOf('Components|TradingHistory', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [TradingHistory],
    },
  })
  .add(
    'default',
    TradingHistoryStory,
    {
      info: {
        text: `
          TradingHistory component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'full screen',
    TradingHistoryStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
