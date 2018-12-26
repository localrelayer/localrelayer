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
  transactions: coreReducers.transactions,
  wallet: coreReducers.wallet,
  tradingInfo: coreReducers.tradingInfo,
  marketQuotes: coreReducers.marketQuotes,
  ui,
});

export default rootReducer;
