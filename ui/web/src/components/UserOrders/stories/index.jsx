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
import UserOrders from '..';

const dataSource = [{
  key: '1',
  pair: 'ZRX/WETH',
  date: '03/10',
  price: 0.00321412,
  amount: 1.1243344,
  total: 0.00361374,
  status: 'Done',
  action: 'Buy',
}, {
  key: '2',
  pair: 'ZRX/WETH',
  date: '03/10',
  price: 0.00321412,
  amount: 1.1243344,
  total: 0.00361374,
  status: 'Pending',
  action: 'Sell',
}, {
  key: '3',
  pair: 'ETH/WETH',
  date: '04/10',
  price: 340.412442,
  amount: 1.0000004,
  total: 341.000244,
  status: 'Done',
  action: 'Buy',
}];

const UserOrdersStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrders orders={dataSource} />
    )}
  />
);

storiesOf('Components|UserOrders', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    UserOrdersStory,
  )
  .add(
    'full screen',
    UserOrdersStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
