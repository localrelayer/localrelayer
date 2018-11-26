import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
} from '@storybook/addon-knobs';
import 'web-styles/main.less';

import UserProfile from '..';

const UserProfileStory = () => (
  <UserProfile />
);

storiesOf('Components|UserProfile', module)
  .addDecorator(withKnobs)
  .add(
    'default',
    UserProfileStory,
  )
  .add(
    'full screen',
    UserProfileStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
