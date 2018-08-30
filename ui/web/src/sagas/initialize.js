// @flow
import {
  put,
} from 'redux-saga/effects';

import type {
  Saga,
} from 'redux-saga';

import * as coreActions from 'instex-core/actions';


export default function* initialize(): Saga<void> {
  console.log('initialize saga');
  yield put(coreActions.fetchAssetPairsRequest());
}
