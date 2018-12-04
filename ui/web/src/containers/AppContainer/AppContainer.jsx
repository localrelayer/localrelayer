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
import {
  getUiState,
} from 'web-selectors';

import Component from 'web-components/ConnectComponent';
import ConnectingToEthProvider from 'web-components/ConnectingToEthProvider';
import NotificationsPanelContainer from 'web-containers/NotificationsPanelContainer';
import TradingPageContainer from 'web-containers/TradingPageContainer';
import UserProfilePageContainer from 'web-containers/UserProfilePageContainer';


const AppContainer = () => (
  <Component
    mapStateToProps={state => ({
      isAppInitializing: getUiState('isAppInitializing')(state),
    })}
  >
    {({ isAppInitializing }) => (
      <Layout>
        <NotificationsPanelContainer />
        {isAppInitializing ? (
          <ConnectingToEthProvider />
        ) : (
          <Switch>
            <Route
              exact
              path="/:baseAsset-:quoteAsset"
              component={TradingPageContainer}
            />
            <Route
              exact
              path="/account"
              component={UserProfilePageContainer}
            />
            <Route
              exact
              path="*"
              render={() => (
                <Redirect to="/ZRX-WETH" />
              )}
            />
          </Switch>
        )}
      </Layout>
    )}
  </Component>
);

export default AppContainer;
