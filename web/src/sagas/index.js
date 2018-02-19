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
  listenShowModal,
} from './ui';

export default function* rootSaga() {
  yield all([
    ...coreSagas,
    fork(listenNotifications),
    fork(listenFillField),
    fork(listenShowModal),
  ]);
}
