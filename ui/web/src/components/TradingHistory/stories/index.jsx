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

const defaultOrders = [{
  key: '1',
  completedAt: '02/29/2018',
  price: 0.003124214,
  amount: 400.242144,
}, {
  key: '2',
  completedAt: '02/30/2018',
  price: 0.033453455,
  amount: 43.1245551,
}, {
  key: '3',
  completedAt: '02/30/2018',
  price: 0.033123444,
  amount: 89.43245661,
}];

const TradingHistoryStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tradingHistory={(
      <TradingHistory orders={defaultOrders} />
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
