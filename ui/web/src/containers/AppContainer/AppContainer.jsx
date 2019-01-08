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
import OrdersInfoModalContainer from 'web-containers/OrdersInfoModalContainer';
import TransactionsPanelContainer from 'web-containers/TransactionsPanelContainer';
import TokensPanelContainer from 'web-containers/TokensPanelContainer';
import TradingPageContainer from 'web-containers/TradingPageContainer';
import UserProfilePageContainer from 'web-containers/UserProfilePageContainer';
import LoaderPage from 'web-components/LoaderPage';
import Tutorial from 'web-containers/TutorialContainer';
import JoyrideWrapperContainer from 'web-containers/JoyrideWrapperContainer';


const AppContainer = () => (
  <Component
    mapStateToProps={state => ({
      isAppInitializing: getUiState('isAppInitializing')(state),
      isNetworkSupported: getUiState('isNetworkSupported')(state),
    })}
  >
    {({ isAppInitializing }) => (
      <Layout>
        <TokensPanelContainer />
        <TransactionsPanelContainer />
        <OrdersInfoModalContainer />
        {isAppInitializing ? (
          <LoaderPage />
        ) : (
          <div>
            <JoyrideWrapperContainer />
            <Tutorial />
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
          </div>
        )}
      </Layout>
    )}
  </Component>
);

export default AppContainer;
