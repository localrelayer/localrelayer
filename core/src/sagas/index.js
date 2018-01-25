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
  listenCurrentTokenChange,
} from './profile';

import {
  listenCallContract,
} from './ethereum';


const coreSagas = [
  fork(listenFetchResourceRequest),
  fork(listenDeleteResourceRequest),
  fork(listenSaveResourceRequest),
  fork(listenCallContract),
  fork(listenCurrentTokenChange),
  fork(initialize),
];

export default coreSagas;
