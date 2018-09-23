import React from 'react';
import {
  Router,
} from 'react-router';
import {
  storiesOf,
} from '@storybook/react';

import {
  getHistory,
} from 'web-history';
import AppContainer from 'web-containers/AppContainer';

storiesOf('Containers|AppContainer', module)
  .add('/ - index route', () => (
    <Router
      history={getHistory('memory', {
        initialEntries: [
          '/',
        ],
        initialIndex: 1,
      })}
    >
      <AppContainer />
    </Router>
  ))
  .add('full screen', () => (
    <Router history={getHistory('memory')}>
      <AppContainer />
    </Router>
  ), {
    options: {
      goFullScreen: true,
    },
  });
