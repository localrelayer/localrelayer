import {
  all,
  fork,
  takeEvery,
} from 'redux-saga/effects';
import {
  coreSagas,
} from 'instex-core';
import * as types from 'instex-core/actionTypes';
import { notification } from 'antd';
import { titleCase } from 'change-case';

function* sendNotification({ payload: { type, message } }) {
  // Ignore metamask errors
  if (message.includes('MetaMask')) return;
  yield notification[type]({
    message: titleCase(message),
  });
}

function* listenNotifications() {
  yield takeEvery(types.SEND_NOTIFICATION, sendNotification);
}

export default function* rootSaga() {
  yield all([
    ...coreSagas,
    fork(listenNotifications),
  ]);
}
