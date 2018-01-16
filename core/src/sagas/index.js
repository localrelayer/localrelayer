import { all, fork } from 'redux-saga/effects';

import {
  listenFetchResourceRequest,
  listenSaveResourceRequest,
  listenDeleteResourceRequest,
} from './resources';

import { initialize } from './initialize';

export default function* rootSaga() {
  yield all([
    fork(initialize),
    fork(listenFetchResourceRequest),
    fork(listenDeleteResourceRequest),
    fork(listenSaveResourceRequest),
  ]);
}
