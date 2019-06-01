import * as eff from 'redux-saga/effects';
import {
  notification,
  Icon,
} from 'antd';
import {
  coreActions,
} from 'localrelayer-core';


function* sendNotification({ config }) {
  yield eff.call(
    notification.open,
    {
      icon: (
        <Icon {...config.iconProps} /> /* eslint-disable-line */
      ),
      ...config,
    },
  );
}

export function* takeNotification() {
  yield eff.takeEvery(
    coreActions.actionTypes.SEND_NOTIFICATION_REQUEST,
    sendNotification,
  );
}
