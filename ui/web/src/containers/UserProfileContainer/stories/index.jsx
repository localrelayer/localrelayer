import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
} from '@storybook/addon-knobs';
import 'web-styles/main.less';

import UserProfileContainer from '..';

const UserProfileContainerStory = () => (
  <UserProfileContainer />
);

storiesOf('Containers|UserProfileContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    UserProfileContainerStory,
  )
  .add(
    'full screen',
    UserProfileContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
