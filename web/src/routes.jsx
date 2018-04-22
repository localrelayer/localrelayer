// @flow
import React from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import {
  Layout,
  Alert,
} from 'antd';
import {
  connect,
} from 'react-redux';
import {
  Helmet,
} from 'react-helmet';
import {
  ConnectedRouter,
} from 'react-router-redux';

import type {
  Token,
} from 'instex-core/types';

import {
  getCurrentToken,
  getCurrentPair,
} from 'instex-core/selectors';

import FAQ from './components/FAQ';
import history from './history';
import UserPage from './containers/UserPage';
import Header from './containers/HeaderContainer';
import TradingPage from './containers/TradingPage';
import JoyrideWrapper from './JoyrideWrapper';
import ModalWrapper from './containers/ModalWrapper';
import Footer from './containers/FooterContainer';

const getTitle = (
  token,
  pair,
) =>
  (
    (token.symbol && pair.symbol) ?
      `${token.symbol}/${pair.symbol}` :
      'Instex'
  );

type Props = {
  bannerMessage: string,
  currentToken: Token,
  currentPair: Token,
};

const routes = ({
  bannerMessage,
  currentToken,
  currentPair,
}: Props) => (
  <ConnectedRouter
    history={history}
    onUpdate={() => {
      console.log('you');
      window.scrollTo(0, 0);
    }}
  >
    <div>
      <JoyrideWrapper />
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {getTitle(
            currentToken,
            currentPair,
          )}
        </title>
      </Helmet>
      <Layout>
        <Header />
        {bannerMessage &&
          <Alert
            banner
            message={bannerMessage}
          />
        }
        <Switch>
          <Route
            exact
            path="/:token-:pair"
            component={TradingPage}
          />
          <Route
            exact
            path="/account"
            component={UserPage}
          />
          <Route
            exact
            path="/faq"
            component={FAQ}
          />
          <Route
            exact
            path="*"
            render={() => (
              <Redirect to="/ZRX-WETH" />
            )}
          />
        </Switch>
        <Footer />
        <ModalWrapper />
      </Layout>
    </div>
  </ConnectedRouter>
);

const mapStateToProps = state => ({
  bannerMessage: state.ui.bannerMessage,
  currentToken: getCurrentToken(state),
  currentPair: getCurrentPair(state),
});

export default connect(mapStateToProps)(routes);
