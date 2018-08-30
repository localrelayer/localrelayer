// @flow
import {
  put,
  takeEvery,
} from 'redux-saga/effects';

import type {
  Saga,
} from 'redux-saga';

import * as coreActions from 'instex-core/actions';
import {
  actionTypes,
} from 'web-actions';


export function* initialize(): Saga<void> {
  console.log('initialize saga');
  yield put(coreActions.fetchAssetPairsRequest());
}

export function* takeInitializeWebApp() {
  yield takeEvery(
    actionTypes.INITIALIZE_WEB_APP,
    initialize,
  );
}
