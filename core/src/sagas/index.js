import {
  fork,
} from 'redux-saga/effects';

import {
  initialize,
} from './initialize';

import {
  listenFetchResourceRequest,
  listenSaveResourceRequest,
  listenDeleteResourceRequest,
} from './resources';

import {
  watchCallContract,
} from './ethereum';


const coreSagas = [
  fork(listenFetchResourceRequest),
  fork(listenDeleteResourceRequest),
  fork(listenSaveResourceRequest),
  fork(initialize),
  fork(watchCallContract),
];

export default coreSagas;
