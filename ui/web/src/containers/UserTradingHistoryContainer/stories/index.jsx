import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import UserProfileLayout from 'web-components/UserProfileLayout';
import UserTradingHistoryContainer from '..';


const UserTradingHistoryContainerStory = () => (
  <UserProfileLayout.Preview
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
