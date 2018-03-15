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
import type {
  MapStateToProps,
} from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import history from './history';
import UserPage from './containers/UserPage';
import Header from './containers/HeaderContainer';
import TradingPage from './containers/TradingPage';

type Props = {
  bannerMessage: string,
};

const routes = ({ bannerMessage }: Props) => (
  <ConnectedRouter
    history={history}
    onUpdate={() => window.scrollTo(0, 0)}
  >
    <div>
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
});

export default connect(mapStateToProps)(routes);
