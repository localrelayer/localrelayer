import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import UserProfileLayout from 'web-components/UserProfileLayout';
import 'web-styles/main.less';
import UserTradingHistory from '..';

const defaultOrders = [{
  key: '1',
  completedAt: '02/29/2018',
  type: 'Sell',
  pair: 'ZRX/WETH',
  price: 0.003124214,
  amount: 400.242144,
  total: 1.250433,
  status: 'Done',
}, {
  key: '2',
  completedAt: '02/30/2018',
  type: 'Buy',
  pair: 'WETH/ZRX',
  price: 0.033453455,
  amount: 43.1245551,
  total: 1.4193434,
  status: 'Canceled',
}, {
  key: '3',
  completedAt: '02/30/2018',
  type: 'Buy',
  pair: 'WETH/ZRX',
  price: 0.033123444,
  amount: 89.43245661,
  total: 2.95119,
  status: 'Pending',
}];

const UserTradingHistoryStory = () => (
  <UserProfileLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userTradingHistory={(
      <UserTradingHistory orders={defaultOrders} />
    )}
  />
);

storiesOf('Components|UserTradingHistory', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [UserTradingHistory],
    },
  })
  .add(
    'default',
    UserTradingHistoryStory,
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
    UserTradingHistoryStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
