// @flow
import '@babel/polyfill';
import React from 'react';
import {
  Router,
} from 'react-router';
import {
  render as reactRender,
} from 'react-dom';
import {
  Provider,
} from 'react-redux';
import {
  hot,
  setConfig,
  cold,
} from 'react-hot-loader';
import {
  LocaleProvider,
} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import Raven from 'raven-js';

import type {
  ComponentType,
} from 'react';

import App from 'web-containers/AppContainer';
import 'web-styles/main.less';
import browserHistory from './history/browser';
import store from './store';
import config from './config';
import './web3Init';

if (config.useSentry) {
  Raven.config(
    'https://02469b8db8c94166a7cc5e9ea82f8d0a@sentry.io/1210496',
  ).install();
}

setConfig({
  pureSFC: true,
  onComponentCreate: type => (
    String(type).indexOf('useState') > 0
      || String(type).indexOf('useEffect') > 0
  ) && cold(type),
});

const rootEl: HTMLElement = window.document.getElementById('body');

const render: Function = (Component: ComponentType<*>) => (
  reactRender(
    <Provider store={store}>
      <LocaleProvider locale={enUS}>
        <Router history={browserHistory}>
          <Component />
        </Router>
      </LocaleProvider>
    </Provider>,
    rootEl,
  )
);

render(hot(module)(App));
