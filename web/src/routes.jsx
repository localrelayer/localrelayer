import React from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import history from './history';
import MainPage from './containers/MainPage';

export default () => (
  <ConnectedRouter
    history={history}
    onUpdate={() => window.scrollTo(0, 0)}
  >
    <Switch>
      <Route
        exact
        path="/:token-:pair"
        component={MainPage}
      />
      <Route
        exact
        path="*"
        render={() => (
          <Redirect to="/ZRX-WETH" />
        )}
      />
    </Switch>
  </ConnectedRouter>
);
