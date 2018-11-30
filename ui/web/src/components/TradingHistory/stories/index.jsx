// @flow
import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import UserProfilePageLayout from 'web-components/UserProfilePageLayout';
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

type Props = {
  isTradingPage: boolean,
  emptyList: boolean,
};

const TradingHistoryStory = ({
  isTradingPage = false,
  emptyList = false,
}: Props) => {
  const PreviewComponent = (
    isTradingPage
      ? TradingPageLayout.Preview
      : UserProfilePageLayout.Preview
  );
  return (
    <PreviewComponent
      hideRest={boolean('Hide preview layout', false)}
      tradingHistory={(
        <TradingHistory
          isTradingPage={isTradingPage}
          orders={emptyList ? [] : defaultOrders}
        />
      )}
    />
  );
};

storiesOf('Components|TradingHistory', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [TradingHistory],
    },
  })
  .add(
    'trading page',
    () => (
      <TradingHistoryStory isTradingPage />
    ),
    {
      info: {
        text: `
          TradingHistory component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'trading page with empty list',
    () => (
      <TradingHistoryStory
        isTradingPage
        emptyList
      />
    ),
    {
      info: {
        text: `
          TradingHistory component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'profile page',
    () => (
      <TradingHistoryStory />
    ),
    {
      info: {
        text: `
          TradingHistory component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'profile page with empty list',
    () => (
      <TradingHistoryStory emptyList />
    ),
    {
      info: {
        text: `
          TradingHistory component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'trading page full screen',
    () => (
      <TradingHistoryStory isTradingPage />
    ),
    {
      options: {
        goFullScreen: true,
      },
    },
  )
  .add(
    'profile page full screen',
    () => (
      <TradingHistoryStory />
    ),
    {
      options: {
        goFullScreen: true,
      },
    },
  );
