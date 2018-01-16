import {
  all,
  fork,
} from 'redux-saga/effects';

import {
  listenFetchResourceRequest,
  listenSaveResourceRequest,
  listenDeleteResourceRequest,
} from './resources';


export default function* rootSaga() {
  yield all([
    fork(listenFetchResourceRequest),
    fork(listenDeleteResourceRequest),
    fork(listenSaveResourceRequest),
  ]);
}
