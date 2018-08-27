// @flow
import {
  combineReducers,
} from 'redux';
import {
  coreReducers,
} from 'instex-core';

const rootReducer = combineReducers({
  assets: coreReducers.assets,
  assetPairs: coreReducers.assetPairs,
});

export default rootReducer;
