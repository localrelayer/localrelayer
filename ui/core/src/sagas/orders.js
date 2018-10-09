import {
  orderHashUtils,
} from '0x.js';
import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';

import {
  actionTypes,
} from '../actions';
import api from '../api';


export function* fetchOrderBook(opts = {}) {
  const actions = createActionCreators('read', {
    resourceType: 'orders',
    requestKey: 'orders',
    list: 'orders',
    mergeListIds: true,
  });
  try {
    yield eff.put(actions.pending());
    const response = yield eff.call(
      api.getOrderBook,
      {
        perPage: 100,
        ...opts,
      },
    );
    const asks = response.asks.records.map(({ order }) => ({
      id: orderHashUtils.getOrderHashHex(order),
      ...order,
    }));
    const bids = response.bids.records.map(({ order }) => ({
      id: orderHashUtils.getOrderHashHex(order),
      ...order,
    }));

    yield eff.put(actions.succeeded({
      resources: asks,
      list: 'asks',
    }));
    yield eff.put(actions.succeeded({
      resources: bids,
      list: 'bids',
    }));
  } catch (err) {
    console.log(err);
    yield eff.put(actions.succeeded({
      resources: [],
    }));
  }
}

export function* takeFetchOrderBook() {
  yield eff.takeEvery(
    actionTypes.FETCH_ORDER_BOOK_REQUEST,
    fetchOrderBook,
  );
}
