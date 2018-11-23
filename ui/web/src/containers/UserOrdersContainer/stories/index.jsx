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
import UserOrdersContainer from '..';


const UserOrdersTradingPageContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrdersContainer />
    )}
  />
);

const UserOrdersUserProfileContainerStory = () => (
  <UserProfileLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrdersContainer />
    )}
  />
);

storiesOf('Containers|UserOrdersContainer', module)
  .addDecorator(withKnobs)
  .add(
    'trading page',
    UserOrdersTradingPageContainerStory,
  )
  .add(
    'user profile page',
    UserOrdersUserProfileContainerStory,
  );
