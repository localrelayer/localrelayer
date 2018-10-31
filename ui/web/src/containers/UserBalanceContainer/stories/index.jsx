import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import UserBalanceContainer from '..';


const UserBalanceContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userBalance={(
      <UserBalanceContainer />
    )}
  />
);

storiesOf('Containers|UserBalanceContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    UserBalanceContainerStory,
  )
  .add(
    'full screen',
    UserBalanceContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
