// @flow
import {
  put,
  takeEvery,
  call
} from 'redux-saga/effects';

import type {
  Saga,
} from 'redux-saga';

import {
  coreSagas,
} from 'instex-core';

import * as coreActions from 'instex-core/actions';
import {
  actionTypes,
} from 'web-actions';


export function* initialize(): Saga<void> {
  console.log('initialize saga');
  yield call(coreSagas.fetchAssetPairs);
  yield put(coreActions.checkPairRequest());
  console.log('done init');
}

export function* takeInitializeWebApp() {
  yield takeEvery(
    actionTypes.INITIALIZE_WEB_APP,
    initialize,
  );
}
