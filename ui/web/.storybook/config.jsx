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
import {
  themes,
} from '@storybook/components';
import {
  withOptions,
} from '@storybook/addon-options';
import {
  withInfo,
} from '@storybook/addon-info';
import {
  configureViewport,
  INITIAL_VIEWPORTS,
} from '@storybook/addon-viewport';

import '../src/mockInit';
import '../src/web3Init';
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

addDecorator(
  withInfo,
);

addDecorator(
  withOptions({
    hierarchySeparator: /\/|\./,
    hierarchyRootSeparator: /\|/,
    theme: themes.dark,
  }),
);

configureViewport({
  viewports: {
    ...INITIAL_VIEWPORTS,
    ...newViewports,
  },
});

addDecorator(render => (
  <Provider store={store}>
    {render()}
  </Provider>
));


function loadStories() {
  require('../src/components/AssetPairCard/stories');
  require('../src/containers/AssetPairCardContainer/stories');
  require('../src/components/TradingPageLayout/stories');
  require('../src/containers/AppContainer/stories');
}

configure(loadStories, module);
