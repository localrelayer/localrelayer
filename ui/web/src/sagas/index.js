import {
  all,
  fork,
} from 'redux-saga/effects';

import {
  initialize,
} from './initialize';

export default function* rootSaga() {
  yield all([
    fork(initialize),
  ]);
}
