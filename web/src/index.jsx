// @flow
import 'regenerator-runtime/runtime';

import React from 'react';
import {
  render as reactRender,
} from 'react-dom';
import {
  Provider,
} from 'react-redux';
import { hot } from 'react-hot-loader';
import {
  LocaleProvider,
} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import Raven from 'raven-js';

import type {
  ComponentType,
} from 'react';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-joyride/lib/react-joyride-compiled.css';
import 'react-select/dist/react-select.css';
import './assets/main.less';

import store from './store';
import App from './App';
import config from './config';

if (config.useSentry) {
  Raven.config('https://60a0dae4681d47d29a4cd77703472a29@sentry.io/153064').install();
}

const rootEl: HTMLElement = window.document.getElementById('body');

const render: Function = (Component: ComponentType<*>) =>
  reactRender(
    <Provider store={store}>
      <LocaleProvider locale={enUS}>
        <Component />
      </LocaleProvider>
    </Provider>,
    rootEl,
  );

render(hot(module)(App));
