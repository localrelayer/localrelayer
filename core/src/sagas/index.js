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

import {
  listenNewOrder,
  listFillOrder,
} from './orders';

const coreSagas = [
  fork(initialize),
  fork(listenFetchResourceRequest),
  fork(listenDeleteResourceRequest),
  fork(listenSaveResourceRequest),
  fork(listenCallContract),
  fork(listenCurrentTokenChange),
  fork(listenNewOrder),
  fork(listFillOrder),
];

export default coreSagas;
