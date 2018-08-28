import React from 'react';
import {
  storiesOf,
} from '@storybook/react';

import GetAssetPairs from '../getAssetPairs';
import GetOrders from '../getOrders';

storiesOf('mockAPI', module)
  .add('getAssetPairs', () => (
    <GetAssetPairs />
  ))
  .add('getOrders', () => (
    <GetOrders />
  ));
