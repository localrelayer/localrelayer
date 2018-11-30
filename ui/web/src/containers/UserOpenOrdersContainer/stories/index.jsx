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
import UserOpenOrdersContainer from '..';


const UserOpenOrdersTradingPageContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOpenOrders={(
      <UserOpenOrdersContainer />
    )}
  />
);

const UserOpenOrdersUserProfileContainerStory = () => (
  <UserProfilePageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOpenOrders={(
      <UserOpenOrdersContainer />
    )}
  />
);

storiesOf('Containers|UserOrdersContainer', module)
  .addDecorator(withKnobs)
  .add(
    'trading page',
    UserOpenOrdersTradingPageContainerStory,
  )
  .add(
    'user profile page',
    UserOpenOrdersUserProfileContainerStory,
  );
