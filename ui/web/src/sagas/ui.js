import * as eff from 'redux-saga/effects';
import {
  notification,
} from 'antd';
import {
  coreActions,
} from 'instex-core';

function* sendNotification({ config }) {
  yield notification[config.status || 'open'](config);
}

export function* takeNotification() {
  yield eff.takeEvery(coreActions.actionTypes.SEND_NOTIFICATION, sendNotification);
}
