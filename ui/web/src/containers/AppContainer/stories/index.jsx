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
  history: any,
};

const AppContainerStory = ({
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
    () => <AppContainerStory />,
  )
  .add(
    '/ZRX-WETH',
    () => (
      <AppContainerStory
        history={
          getHistory(
            'memory',
            {
              initialEntries: [
                '/ZRX-WETH',
              ],
              initialIndex: 0,
            },
          )}
      />
    ),
  )
  .add(
    '/ABX-WETH - using addresses',
    () => (
      <AppContainerStory
        history={
          getHistory(
            'memory',
            {
              initialEntries: [
                [
                  '/0x9a794dc1939f1d78fa48613b89b8f9d0a20da00e',
                  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                ].join('-'),
              ],
              initialIndex: 0,
            },
          )}
      />
    ),
  )
  .add(
    '/WRONG-WETH - wrong addresses',
    () => (
      <AppContainerStory
        history={
          getHistory(
            'memory',
            {
              initialEntries: [
                [
                  '/FAKE',
                  'WETH',
                ].join('-'),
              ],
              initialIndex: 0,
            },
          )}
      />
    ),
  )
  .add(
    'full screen',
    () => <AppContainerStory />,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
