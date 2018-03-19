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
import type {
  MapStateToProps,
} from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import {
  getCurrentToken,
  getCurrentPair,
} from 'instex-core/selectors';
import type {
  Token,
} from 'instex-core/types';
import history from './history';
import UserPage from './containers/UserPage';
import Header from './containers/HeaderContainer';
import TradingPage from './containers/TradingPage';

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
    onUpdate={() => window.scrollTo(0, 0)}
  >
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{getTitle(currentToken, currentPair)}</title>
      </Helmet>
      <Layout>
        <Header />
        {bannerMessage && <Alert message={bannerMessage} banner />}
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
            path="*"
            render={() => (
              <Redirect to="/ZRX-WETH" />
        )}
          />
        </Switch>
      </Layout>
    </div>
  </ConnectedRouter>
);

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  bannerMessage: state.ui.bannerMessage,
  currentToken: getCurrentToken(state),
  currentPair: getCurrentPair(state),
});

const getTitle = (token, pair) => {
  if (token.symbol && pair.symbol) {
    return `${token.symbol}/${pair.symbol}`;
  }
  return 'Instex';
};

export default connect(mapStateToProps)(routes);
