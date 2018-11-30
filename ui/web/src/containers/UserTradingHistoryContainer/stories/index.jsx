import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import UserProfilePageLayout from 'web-components/UserProfilePageLayout';
import UserTradingHistoryContainer from '..';


const UserTradingHistoryContainerStory = () => (
  <UserProfilePageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userTradingHistory={(
      <UserTradingHistoryContainer />
    )}
  />
);

storiesOf('Containers|UserTradingHistoryContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    UserTradingHistoryContainerStory,
  )
  .add(
    'full screen',
    UserTradingHistoryContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
