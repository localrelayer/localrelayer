import React from 'react';
import {
  MemoryRouter,
} from 'react-router';
import {
  storiesOf,
} from '@storybook/react';

import AppContainer from 'web-containers/AppContainer';

storiesOf('AppContainer', module)
  .add('/ - index route', () => (
    <MemoryRouter
      initialEntries={[
        '/',
      ]}
      initialIndex={1}
    >
      <AppContainer />
    </MemoryRouter>
  ));
