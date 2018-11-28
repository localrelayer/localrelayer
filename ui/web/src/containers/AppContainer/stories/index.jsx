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
import AppContainer from 'web-containers/AppContainer';


type Props = {
  route: string,
  history?: any,
};

class AppContainerStory extends React.Component<Props> {
  componentDidMount() {
    const {
      route,
      history,
    } = this.props;
    history.push(route);
  }

  componentWillUnmount() {
    store.dispatch(uiActions.setUiState({
      isAppInitializing: false,
    }));
  }

  render() {
    const { history } = this.props;
    button(
      'Toggle isAppLoading',
      () => {
        store.dispatch(uiActions.setUiState({
          isAppInitializing: !store.getState().ui.isAppInitializing,
        }));
      },
    );
    return (
      <Router history={history}>
        <AppContainer />
      </Router>
    );
  }
}
AppContainerStory.defaultProps = {
  history: getHistory(
    'memory',
    {
      initialEntries: [
        '/',
      ],
      initialIndex: 0,
    },
  ),
};

storiesOf('Containers|AppContainer', module)
  .addDecorator(withKnobs)
  .add(
    '/ - index route',
    () => (
      <AppContainerStory
        route="/"
      />
    ),
  )
  .add(
    '/ZRX-WETH',
    () => (
      <AppContainerStory
        route="/ZRX-WETH"
      />
    ),
  )
  .add(
    '/ABX-WETH - using addresses',
    () => (
      <AppContainerStory
        route={[
          '/0x9a794dc1939f1d78fa48613b89b8f9d0a20da00e',
          '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        ].join('-')}
      />
    ),
  )
  .add(
    '/WRONG-WETH - wrong addresses',
    () => (
      <AppContainerStory
        route={[
          '/FAKE',
          'WETH',
        ].join('-')}
      />
    ),
  )
  .add(
    'full screen',
    () => (
      <AppContainerStory
        route="/"
      />
    ),
    {
      options: {
        goFullScreen: true,
      },
    },
  );
