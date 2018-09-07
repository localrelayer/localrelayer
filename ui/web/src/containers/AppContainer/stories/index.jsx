import React from 'react';
import {
  Router,
} from 'react-router';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  button,
} from '@storybook/addon-knobs';

import {
  getHistory,
} from 'web-history';
import {
  uiActions,
} from 'web-actions';

import store from 'web-store';
import Component from 'web-components/ConnectComponent';
import AppContainer from 'web-containers/AppContainer';


const AppContainerStory = () => {
  /*
   * Knob button will dissapear after change the store
   * if register button on global scope or on DidMount,
   * the reason is unknows, probably a bug
  */
  button(
    'Toggle isAppLoading',
    () => {
      store.dispatch(uiActions.setUiState({
        isAppInitializing: !store.getState().ui.isAppInitializing,
      }));
    },
  );
  return (
    <Component
      componentWillUnmount={({ dispatch }) => {
        dispatch(uiActions.setUiState({
          isAppInitializing: false,
        }));
      }}
    >
      {() => (
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
      )}
    </Component>
  );
};

storiesOf('Containers|AppContainer', module)
  .addDecorator(withKnobs)
  .add('/ - index route', AppContainerStory)
  .add('full screen', AppContainerStory, {
    options: {
      goFullScreen: true,
    },
  });
