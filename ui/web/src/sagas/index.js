import {
  all,
  fork,
} from 'redux-saga/effects';

import {
  takeInitializeWebApp,
} from './initialize';

export default function* rootSaga() {
  yield all([
    fork(takeInitializeWebApp),
  ]);
}
