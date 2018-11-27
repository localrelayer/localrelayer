// @flow
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


type Props = {
  route: string,
  history: any,
};

const AppContainerStory = ({
  route,
  history = getHistory(
    'memory',
    {
      initialEntries: [
        '/',
      ],
      initialIndex: 0,
    },
  ),
}: Props) => {
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
  if (route) {
    history.push(route);
  }
  return (
    <Component
      componentWillUnmount={({ dispatch }) => {
        dispatch(uiActions.setUiState({
          isAppInitializing: false,
        }));
      }}
    >
      {() => (
        <Router history={history}>
          <AppContainer />
        </Router>
      )}
    </Component>
  );
};

storiesOf('Containers|AppContainer', module)
  .addDecorator(withKnobs)
  .add(
    '/ - index route',
    () => (
      <AppContainerStory />
    ),
  );
