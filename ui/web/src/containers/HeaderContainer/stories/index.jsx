import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
} from '@storybook/addon-knobs';

import HeaderContainer from '..';

storiesOf('Containers|HeaderContainer', module)
  .addDecorator(withKnobs)
  .add(
    'default', () => (
      <HeaderContainer />
    ),
  )
  .add(
    'full screen', () => (
      <HeaderContainer />
    ),
    {
      options: {
        goFullScreen: true,
      },
    },
  );
