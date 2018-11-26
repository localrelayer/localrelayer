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
  <UserProfileLayout.Preview
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
