import {
  all,
  fork,
} from 'redux-saga/effects';
import {
  coreSagas,
} from 'instex-core';

import initialize from './initialize';

export default function* rootSaga() {
  yield all([
    fork(coreSagas.takeFetchAssetPairsRequest),
    fork(initialize),
  ]);
}
