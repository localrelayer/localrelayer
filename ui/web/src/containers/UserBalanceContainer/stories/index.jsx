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
import UserBalanceContainer from '..';


const UserBalanceTradingPageContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userBalance={(
      <UserBalanceContainer isTradingPage />
    )}
  />
);

const UserBalanceUserProfileContainerStory = () => (
  <UserProfilePageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userBalance={(
      <UserBalanceContainer isTradingPage={false} />
    )}
  />
);

storiesOf('Containers|UserBalanceContainer', module)
  .addDecorator(withKnobs)
  .add(
    'trading page',
    UserBalanceTradingPageContainerStory,
  )
  .add(
    'user profile page',
    UserBalanceUserProfileContainerStory,
  );
