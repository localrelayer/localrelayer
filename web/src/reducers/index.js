// @flow
import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { reducers as coreReducers } from 'instex-core';

const rootReducer = combineReducers({
  form: formReducer,
  ...coreReducers.resourcesReducers,
  ethereum: coreReducers.ethereum,
  profile: coreReducers.profile,
});

export default rootReducer;
