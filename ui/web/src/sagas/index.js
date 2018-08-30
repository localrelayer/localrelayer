import {
  all,
  fork,
} from 'redux-saga/effects';
import {
  coreSagas,
} from 'instex-core';

import {
  takeInitializeWebApp,
} from './initialize';

export default function* rootSaga() {
  yield all([
    fork(coreSagas.takeFetchAssetPairsRequest),
    fork(takeInitializeWebApp),
  ]);
}
