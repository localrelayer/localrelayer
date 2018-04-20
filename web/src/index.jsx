// @flow
import 'regenerator-runtime/runtime';

import React from 'react';
import {
  render as reactRender,
} from 'react-dom';
import {
  Provider,
} from 'react-redux';
import {
  AppContainer,
} from 'react-hot-loader';
import {
  LocaleProvider,
} from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

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

const rootEl: HTMLElement = window.document.getElementById('body');

const render: Function = (Component: ComponentType<*>) =>
  reactRender(
    <AppContainer>
      <Provider store={store}>
        <LocaleProvider locale={enUS}>
          <Component />
        </LocaleProvider>
      </Provider>
    </AppContainer>,
    rootEl,
  );

render(App);
if (module.hot) {
  // $FlowFixMe
  module.hot.accept('./App', () => {
    const NewApp = require('./App').default; // eslint-disable-line
    render(NewApp);
  });
}
