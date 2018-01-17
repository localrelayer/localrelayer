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


const coreSagas = [
  fork(listenFetchResourceRequest),
  fork(listenDeleteResourceRequest),
  fork(listenSaveResourceRequest),
  fork(initialize),
];

export default coreSagas;
