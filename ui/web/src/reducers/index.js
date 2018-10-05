// @flow
import {
  combineReducers,
} from 'redux';
import {
  coreReducers,
} from 'instex-core';

import ui from './ui';

const rootReducer = combineReducers({
  assets: coreReducers.assets,
  assetPairs: coreReducers.assetPairs,
  orders: coreReducers.orders,
  wallet: coreReducers.wallet,
  ui,
});

export default rootReducer;
