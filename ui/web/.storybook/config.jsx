/* eslint-disable global-require */
import '@babel/polyfill';
import React from 'react';
import {
  Provider,
} from 'react-redux';

import {
  configure,
  addDecorator,
} from '@storybook/react';

import '../src/mockInit';
import '../src/web3Init';
import {
  configureViewport,
  INITIAL_VIEWPORTS,
} from '@storybook/addon-viewport';
import store from '../src/store';


const newViewports = {
  mobile: {
    name: 'Mobile',
    styles: {
      width: '320px',
      height: '568px',
    },
  },
  tablet: {
    name: 'Tablet',
    styles: {
      width: '768px',
      height: '1024px',
    },
  },
  laptop: {
    name: 'Laptop',
    styles: {
      width: '1200px',
      height: '1024px',
    },
  },
  desktop: {
    name: 'Desktop',
    styles: {
      width: '1366px',
      height: '1024px',
    },
  },
  wide: {
    name: 'Wide',
    styles: {
      width: '1920px',
      height: '1080px',
    },
  },
};

configureViewport({
  viewports: {
    ...INITIAL_VIEWPORTS,
    ...newViewports,
  },
});


function loadStories() {
  require('../src/components/AssetPairCard/stories');
  require('../src/components/TradingPageLayout/stories');
}

addDecorator(render => (
  <Provider store={store}>
    {render()}
  </Provider>
));

configure(loadStories, module);
