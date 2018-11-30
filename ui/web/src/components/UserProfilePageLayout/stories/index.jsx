import React from 'react';
import {
  storiesOf,
} from '@storybook/react';

import UserProfilePageLayout from '..';

storiesOf('Components|UserProfilePageLayout', module)
  .add('preview', () => (
    <UserProfilePageLayout.Preview />
  ))
  .add('full screen', () => (
    <UserProfilePageLayout.Preview />
  ), {
    options: {
      goFullScreen: true,
    },
  });
