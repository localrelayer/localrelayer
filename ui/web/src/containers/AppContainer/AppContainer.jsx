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
import NetworkNotSupported from 'web-components/NetworkNotSupported';
import TransactionsPanelContainer from 'web-containers/TransactionsPanelContainer';
import TradingPageContainer from 'web-containers/TradingPageContainer';
import UserProfilePageContainer from 'web-containers/UserProfilePageContainer';
import LoaderPage from 'web-components/LoaderPage';


const AppContainer = () => (
  <Component
    mapStateToProps={state => ({
      isAppInitializing: getUiState('isAppInitializing')(state),
      isMetaMaskPresent: getUiState('isMetaMaskPresent')(state),
      isNetworkSupported: getUiState('isNetworkSupported')(state),
    })}
  >
    {({
      isAppInitializing,
      isMetaMaskPresent,
      isNetworkSupported,
    }) => {
      if (!isMetaMaskPresent) return (<ConnectingToEthProvider />);
      if (!isNetworkSupported) return (<NetworkNotSupported />);
      return (
        <Layout>
          <TransactionsPanelContainer />
          {isAppInitializing ? (
            <LoaderPage />
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
      );
    }}
  </Component>
);

export default AppContainer;
