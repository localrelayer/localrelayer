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
import UserOpenOrders from '..';

const now = new Date();
const defaultOrders = [{
  id: '1',
  pair: 'ZRX/WETH',
  price: 0.003212,
  amount: 1.12344,
  total: 0.003674,
  action: 'Buy',
  metaData: {
    createdAt: new Date(now - 5 * 60000).toString(),
    isValid: false,
    isShadowed: true,
  },
}, {
  id: '2',
  pair: 'ZRX/WETH',
  price: 0.003212,
  amount: 1.12434,
  total: 0.003614,
  action: 'Sell',
  metaData: {
    createdAt: new Date(now - 10 * 60000).toString(),
    isValid: true,
    isShadowed: false,
  },
}, {
  id: '3',
  pair: 'ETH/WETH',
  price: 340.4122,
  amount: 1.00004,
  total: 341.0004,
  action: 'Buy',
  metaData: {
    createdAt: new Date(now - 15 * 60000).toString(),
    isValid: true,
    isShadowed: false,
  },
}];

type Props = {
  isTradingPage: boolean,
  emptyList: boolean,
};

const UserOpenOrdersStory = ({
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
      userOpenOrders={(
        <UserOpenOrders orders={emptyList ? [] : defaultOrders} />
      )}
    />
  );
};

storiesOf('Components|UserOpenOrders', module)
  .addDecorator(withKnobs)
  .add(
    'trading page',
    () => (
      <UserOpenOrdersStory isTradingPage />
    ),
  )
  .add(
    'trading page with empty list',
    () => (
      <UserOpenOrdersStory
        isTradingPage
        emptyList
      />
    ),
  )
  .add(
    'user profile page',
    () => (
      <UserOpenOrdersStory />
    ),
  )
  .add(
    'user profile page with empty list',
    () => (
      <UserOpenOrdersStory emptyList />
    ),
  );
