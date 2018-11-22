import {
  generatePseudoRandomSalt,
  orderHashUtils,
  signatureUtils,
  MetamaskSubprovider,
} from '0x.js';
import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import {
  actionTypes,
} from '../actions';

import api from '../api';
import ethApi from '../ethApi';
import {
  getContractAddressesForNetwork,
} from '../utils';


export function* fetchOrderBook(opts = {}) {
  const actions = createActionCreators('read', {
    resourceType: 'orders',
    requestKey: 'orders',
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
    const asks = response.asks.records.map(({
      order,
      metaData,
    }) => ({
      id: orderHashUtils.getOrderHashHex(order),
      metaData,
      ...order,
    }));
    const bids = response.bids.records.map(({
      order,
      metaData,
    }) => ({
      id: orderHashUtils.getOrderHashHex(order),
      metaData,
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

export function* fetchTradingHistory(opts = {}) {
  const actions = createActionCreators('read', {
    resourceType: 'orders',
    requestKey: 'tradingHistory',
    list: 'tradingHistory',
    mergeListIds: false,
  });
  try {
    yield eff.put(actions.pending());
    const response = yield eff.call(
      api.getTradingHistory,
      {
        ...opts,
      },
    );
    const orders = response.records.map(order => ({
      id: orderHashUtils.getOrderHashHex(order),
      ...order,
    }));

    yield eff.put(actions.succeeded({
      resources: orders,
      list: 'tradingHistory',
    }));
  } catch (err) {
    console.log(err);
    yield eff.put(actions.succeeded({
      resources: [],
    }));
  }
}

function* postOrder({
  formActions,
  order: {
    makerAddress,
    takerAddress,
    makerAssetData,
    takerAssetData,
    makerAssetAmount,
    takerAssetAmount,
    expirationTimeSeconds,
  },
}) {
  const web3 = ethApi.getWeb3();
  const networkId = yield eff.call(web3.eth.net.getId);
  const provider = new MetamaskSubprovider(web3.currentProvider);

  const exchangeAddress = getContractAddressesForNetwork(networkId).exchange;
  const orderConfigRequest = {
    exchangeAddress,
    makerAddress,
    takerAddress,
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
    expirationTimeSeconds,
  };
  try {
    const orderConfig = yield eff.call(
      api.postOrderConfig,
      orderConfigRequest,
    );
    const order = {
      salt: generatePseudoRandomSalt(),
      ...orderConfigRequest,
      ...orderConfig,
    };
    const signedOrder = yield eff.call(
      signatureUtils.ecSignOrderAsync,
      provider,
      order,
      makerAddress,
    );
    yield eff.call(api.postOrder, signedOrder, { networkId });
    formActions.resetForm({});
  } catch (err) {
    console.log(err);
    formActions.setFieldError(
      'balance',
      'Backend validation failed',
    );
  }
  formActions.setSubmitting(false);
}

export function* takePostOrder() {
  yield eff.takeEvery(actionTypes.POST_ORDER_REQUEST, postOrder);
}
