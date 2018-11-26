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

const dataSource = [{
  key: '1',
  pair: 'ZRX/WETH',
  date: '03/10',
  price: 0.003212,
  amount: 1.12344,
  total: 0.003674,
  status: 'Done',
  action: 'Buy',
}, {
  key: '2',
  pair: 'ZRX/WETH',
  date: '03/10',
  price: 0.003212,
  amount: 1.12434,
  total: 0.003614,
  status: 'Shadow',
  action: 'Sell',
}, {
  key: '3',
  pair: 'ETH/WETH',
  date: '04/10',
  price: 340.4122,
  amount: 1.00004,
  total: 341.0004,
  status: 'Done',
  action: 'Buy',
}];

const UserOrdersTradingPageStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrders orders={dataSource} />
    )}
  />
);
const UserOrdersUserProfileStory = () => (
  <UserProfileLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrders orders={dataSource} />
    )}
  />
);

storiesOf('Components|UserOrders', module)
  .addDecorator(withKnobs)
  .add(
    'trading page',
    UserOrdersTradingPageStory,
  )
  .add(
    'user profile page',
    UserOrdersUserProfileStory,
  );
