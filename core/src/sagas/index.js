// @flow
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
  listenCallContract,
} from './ethereum';

import {
  listenNewOrder,
  listenCancelOrder,
  listenFillOrKillOrders,
} from './orders';

import {
  listenChangeProvider,
  listenSetAddress,
} from './profile';

const coreSagas = [
  fork(initialize),
  fork(listenFetchResourceRequest),
  fork(listenDeleteResourceRequest),
  fork(listenSaveResourceRequest),
  fork(listenCallContract),
  fork(listenNewOrder),
  fork(listenCancelOrder),
  fork(listenChangeProvider),
  fork(listenSetAddress),
  fork(listenFillOrKillOrders),
];

export default coreSagas;
