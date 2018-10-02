import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import UserOrdersContainer from '..';


const UserOrdersContainerStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    userOrders={(
      <UserOrdersContainer />
    )}
  />
);

storiesOf('Containers|UserOrdersContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    UserOrdersContainerStory,
  )
  .add(
    'full screen',
    UserOrdersContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
