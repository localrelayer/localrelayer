import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
} from '@storybook/addon-knobs';
import 'web-styles/main.less';

import UserProfilePageContainer from '..';

const UserProfilePageContainerStory = () => (
  <UserProfilePageContainer />
);

storiesOf('Containers|UserProfilePageContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    UserProfilePageContainerStory,
  )
  .add(
    'full screen',
    UserProfilePageContainerStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
