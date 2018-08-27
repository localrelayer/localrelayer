import '@babel/polyfill';
import React from 'react';
import {
  Provider,
} from 'react-redux';

import {
  configure,
  addDecorator,
} from '@storybook/react';

import store from '../src/store';

function loadStories() {
  require('../src/components/AssetPairCard/stories/index.jsx');
  // You can require as many stories as you need.
}

addDecorator((render) =>
  <Provider store={store}>
    {render()}
  </Provider>
);

configure(loadStories, module);
