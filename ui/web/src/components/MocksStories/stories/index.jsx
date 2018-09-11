import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import GetAssetPairs from '../getAssetPairs';
import GetOrders from '../getOrders';
import GetOrderBook from '../getOrderBook';

storiesOf('mockAPI', module)
  .add(
    'GetAssetPairs',
    () => (
      <GetAssetPairs />
    ),
  )
  .add(
    'GetOrders',
    () => (
      <GetOrders />
    ),
  )
  .add(
    'GetOrderBook',
    () => (
      <GetOrderBook />
    ),
  );
