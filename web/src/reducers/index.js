// @flow
import {
  combineReducers,
} from 'redux';
import {
  reducer as formReducer,
} from 'redux-form';
import {
  reducers as coreReducers,
} from 'instex-core';
import {
  routerReducer,
} from 'react-router-redux';

const rootReducer = combineReducers({
  router: routerReducer,
  form: formReducer,
  orders: coreReducers.orders,
  tokens: coreReducers.tokens,
  profile: coreReducers.profile,
  ui: coreReducers.ui,
});

export default rootReducer;
