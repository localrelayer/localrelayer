import {
  all,
  fork,
} from 'redux-saga/effects';
import {
  coreSagas,
} from 'instex-core';
import {
  listenFillField,
  listenNotifications,
} from './ui';

export default function* rootSaga() {
  yield all([
    ...coreSagas,
    fork(listenNotifications),
    fork(listenFillField),
  ]);
}
