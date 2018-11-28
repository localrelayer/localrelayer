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
import UserProfileLayout from 'web-components/UserProfileLayout';
import 'web-styles/main.less';
import UserOrders from '..';

const now = new Date();
const defaultOrders = [{
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
  emptyList: boolean,
};

const UserOrdersTradingPageStory = ({ emptyList = false }: Props) => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrders orders={emptyList ? [] : defaultOrders} />
    )}
  />
);
const UserOrdersUserProfileStory = ({ emptyList = false }: Props) => (
  <UserProfileLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrders orders={emptyList ? [] : defaultOrders} />
    )}
  />
);

storiesOf('Components|UserOrders', module)
  .addDecorator(withKnobs)
  .add(
    'trading page',
    () => (
      <UserOrdersTradingPageStory />
    ),
  )
  .add(
    'trading page with empty list',
    () => (
      <UserOrdersTradingPageStory emptyList />
    ),
  )
  .add(
    'user profile page',
    () => (
      <UserOrdersUserProfileStory />
    ),
  )
  .add(
    'user profile page with empty list',
    () => (
      <UserOrdersUserProfileStory emptyList />
    ),
  );
