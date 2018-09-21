// @flow
import React from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import {
  Layout,
} from 'antd';

import Component from 'web-components/ConnectComponent';
import TradingPage from 'web-containers/TradingPage';

const AppContainer = () => (
  <Component>
    {() => (
      <Layout>
        <Switch>
          <Route
            exact
            path="/:baseAsset-:quoteAsset"
            component={TradingPage}
          />
          <Route
            exact
            path="*"
            render={() => (
              <Redirect to="/ZRX-WETH" />
            )}
          />
        </Switch>
      </Layout>
    )}
  </Component>
);

export default AppContainer;
