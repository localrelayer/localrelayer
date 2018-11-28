import {
  generatePseudoRandomSalt,
  signatureUtils,
  MetamaskSubprovider,
  BigNumber,
} from '0x.js';
import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import {
  actionTypes,
} from '../actions';
import * as selectors from '../selectors';
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
      id: order.signature,
      metaData,
      ...order,
    }));
    const bids = response.bids.records.map(({
      order,
      metaData,
    }) => ({
      id: order.signature,
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
    const orders = response.records.map(({ order, metaData }) => ({
      id: order.signature,
      ...order,
      metaData,
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

export function* fetchUserOrders(opts = {}) {
  const actions = createActionCreators('read', {
    resourceType: 'orders',
    requestKey: 'userOrders',
    list: 'userOrders',
    mergeListIds: false,
  });
  try {
    yield eff.put(actions.pending());
    const response = yield eff.call(
      api.getOpenOrders,
      {
        ...opts,
      },
    );
    const orders = response.records.map(({ order, metaData }) => ({
      id: order.signature,
      ...order,
      metaData,
    }));

    yield eff.put(actions.succeeded({
      resources: orders,
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
    type,
  },
}) {
  const web3 = ethApi.getWeb3();
  const networkId = yield eff.call(web3.eth.net.getId);
  const provider = new MetamaskSubprovider(web3.currentProvider);
  const contractWrappers = ethApi.getWrappers(networkId);
  const exchangeAddress = getContractAddressesForNetwork(networkId).exchange;

  const counterOrderType = type === 'bid' ? 'Ask' : 'Bid';
  const orders = yield eff.select(selectors[`get${counterOrderType}Orders`]);
  const taker = yield eff.select(selectors.getWalletState('selectedAccount'));

  const matchedOrders = orders.filter(o => new BigNumber(o.makerAssetAmount).eq(takerAssetAmount)
    && new BigNumber(o.takerAssetAmount).eq(makerAssetAmount));

  // TODO: Not fully filled and batch fill

  if (matchedOrders.length) {
    const txHash = yield eff.call(
      [
        contractWrappers.exchange,
        contractWrappers.exchange.fillOrderAsync,
      ],
      matchedOrders[0],
      takerAssetAmount,
      taker,
    );
    console.log('FILLED WITH HASH', txHash);
    formActions.resetForm({});
  } else {
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
  }
  formActions.setSubmitting(false);
}

export function* takePostOrder() {
  yield eff.takeEvery(actionTypes.POST_ORDER_REQUEST, postOrder);
}
