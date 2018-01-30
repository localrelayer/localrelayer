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
  ...coreReducers.resourcesReducers,
  ethereum: coreReducers.ethereum,
  profile: coreReducers.profile,
  ui: coreReducers.ui,
});

export default rootReducer;
