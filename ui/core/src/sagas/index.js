// @flow
import {
  fork,
} from 'redux-saga/effects';

import {
  takeFetchAssetPairsRequest,
} from './assets';

const coreSagas = [
  fork(takeFetchAssetPairsRequest),
];

export default coreSagas;
