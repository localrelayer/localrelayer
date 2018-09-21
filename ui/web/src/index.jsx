// @flow
import '@babel/polyfill';
import React from 'react';
import {
  BrowserRouter,
} from 'react-router-dom';
import {
  render as reactRender,
} from 'react-dom';
import {
  Provider,
} from 'react-redux';
import {
  hot,
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
import store from './store';
import config from './config';
import './web3Init';

if (config.useSentry) {
  Raven.config(
    'https://02469b8db8c94166a7cc5e9ea82f8d0a@sentry.io/1210496',
  ).install();
}

const rootEl: HTMLElement = window.document.getElementById('body');

const render: Function = (Component: ComponentType<*>) => (
  reactRender(
    <Provider store={store}>
      <LocaleProvider locale={enUS}>
        <BrowserRouter>
          <Component />
        </BrowserRouter>
      </LocaleProvider>
    </Provider>,
    rootEl,
  )
);

render(hot(module)(App));
