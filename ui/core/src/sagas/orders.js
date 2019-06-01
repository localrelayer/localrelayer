import {
  generatePseudoRandomSalt,
  signatureUtils,
  MetamaskSubprovider,
  BigNumber,
} from '0x.js';
import * as eff from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import {
  utils,
} from 'localrelayer-core';
import {
  actionTypes,
  sendShowModalRequest,
  setWalletState,
  sendNotificationRequest,
} from '../actions';
import * as selectors from '../selectors';
import api from '../api';
import ethApi from '../ethApi';
import {
  getContractAddressesForNetwork,
  transformBigNumberOrder,
} from '../utils';
import {
  saveTransaction,
} from './transactions';


export function* fetchOrderBook(opts = {}) {
  const actions = createActionCreators('read', {
    resourceType: 'orders',
    requestKey: 'orders',
    mergeListIds: false,
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

export function* fetchUserTradingHistory(opts = {}) {
  const actions = createActionCreators('read', {
    resourceType: 'orders',
    requestKey: 'userTradingHistory',
    list: 'userTradingHistory',
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

function* matchOrder({
  order,
  type,
}) {
  let price;
  let matchedOrders = [];
  const makerAddress = yield eff.select(selectors.getWalletState('selectedAccount'));

  if (type === 'bid') {
    price = new BigNumber(order.makerAssetAmount).div(order.takerAssetAmount);
    const askOrders = yield eff.select(selectors.getAskOrders);

    matchedOrders = askOrders.filter((askOrder) => {
      const matchedAskOrderPrice = new BigNumber(
        askOrder.takerAssetAmount,
      ).div(askOrder.makerAssetAmount);
      return matchedAskOrderPrice.lte(price) && askOrder.makerAddress !== makerAddress;
    });
  } else {
    price = new BigNumber(order.takerAssetAmount).div(order.makerAssetAmount);
    const bidOrders = yield eff.select(selectors.getBidOrders);

    matchedOrders = bidOrders.filter((bidOrder) => {
      const matchedBidOrderPrice = new BigNumber(
        bidOrder.makerAssetAmount,
      ).div(bidOrder.takerAssetAmount);
      return matchedBidOrderPrice.gte(price) && bidOrder.makerAddress !== makerAddress;
    });
  }
  return matchedOrders.reduce((acc, cur) => {
    const neededAmount = cur.metaData.remainingFillableTakerAssetAmount;
    const toBeFilledAmount = BigNumber.min(neededAmount, acc.existingAssetAmount);
    const existingAssetAmount = acc.existingAssetAmount.minus(toBeFilledAmount);
    const filledMakerAssetAmount = new BigNumber(cur.makerAssetAmount)
      .times(toBeFilledAmount)
      .div(cur.takerAssetAmount);
    return {
      ordersToFill: acc.ordersToFill.concat(cur),
      makerAssetFillAmounts: acc.makerAssetFillAmounts.concat(filledMakerAssetAmount),
      takerAssetFillAmounts: acc.takerAssetFillAmounts.concat(toBeFilledAmount),
      existingAssetAmount,
    };
  }, {
    ordersToFill: [],
    makerAssetFillAmounts: [],
    takerAssetFillAmounts: [],
    existingAssetAmount: new BigNumber(order.makerAssetAmount),
  });
}

export function* fillOrder({
  order,
  formActions,
  ordersToFill,
  makerAssetFillAmounts,
  takerAssetFillAmounts,
  existingAssetAmount = new BigNumber(0),
}) {
  const networkId = yield eff.call(web3.eth.net.getId);
  const contractWrappers = ethApi.getWrappers(networkId);
  const taker = yield eff.select(selectors.getWalletState('selectedAccount'));

  const toBeViewedOrders = ordersToFill.map((o, i) => {
    const makerAssetAmount = makerAssetFillAmounts[i];
    const takerAssetAmount = takerAssetFillAmounts[i];

    return {
      ...o,
      makerAssetAmount,
      takerAssetAmount,
    };
  });

  yield eff.put(setWalletState({ matchedOrders: toBeViewedOrders }));


  yield eff.put(sendShowModalRequest('OrdersInfo'));
  const { isConfirmed } = yield eff.take(actionTypes.CHECK_MODAL_STATUS);
  if (isConfirmed) {
    try {
      const txHash = yield eff.call(
        [
          contractWrappers.exchange,
          contractWrappers.exchange.batchFillOrKillOrdersAsync,
        ],
        ordersToFill,
        takerAssetFillAmounts,
        taker,
      );
      console.log('FILLED WITH HASH', txHash);

      const filledOrders = ordersToFill.map((filledOrder, i) => ({
        makerAddress: filledOrder.makerAddress,
        orderHash: filledOrder.metaData.orderHash,
        filledAmount: takerAssetFillAmounts[i],
      }));

      const totalFilledAmount = takerAssetFillAmounts
        .reduce((acc, cur) => acc.add(cur), new BigNumber(0));
      const assets = yield eff.select(selectors.getResourceMap('assets'));
      // TODO: include all filled orders to transaction meta
      const ordersInfo = ordersToFill[ordersToFill.length - 1];

      const newTakerAmount = new BigNumber(order.takerAssetAmount)
        .times(existingAssetAmount)
        .div(order.makerAssetAmount);

      yield eff.fork(
        saveTransaction,
        {
          transactionHash: txHash,
          address: taker.toLowerCase(),
          name: 'Fill',
          networkId,
          meta: {
            filledMakerAssetAmount: totalFilledAmount,
            filledTakerAssetAmount: new BigNumber(order.takerAssetAmount).minus(newTakerAmount),
            filledOrders,
            price: ordersInfo.price,
            pair: `${assets[ordersInfo.makerAssetData].symbol}/${assets[ordersInfo.takerAssetData].symbol}`,
            makerAssetData: order.makerAssetData,
            takerAssetData: order.takerAssetData,
          },
        },
      );

      if (existingAssetAmount.gt(0)) {
        // eslint-disable-next-line
        yield eff.call(postOrder, {
          formActions,
          order: {
            ...order,
            makerAssetAmount: existingAssetAmount,
            takerAssetAmount: newTakerAmount,
          },
          shouldMatch: false,
        });
      } else {
        formActions?.resetForm({
          expirationNumber: 1,
          expirationUnit: 'months',
          shouldMatch: true,
        });
        formActions?.setSubmitting(false);
      }
    } catch (e) {
      const isMetamaskDenied = e.message === 'SIGNATURE_REQUEST_DENIED';
      const notificationConfig = {
        key: 1,
        placement: 'topLeft',
        message: isMetamaskDenied ? 'You canceled transaction' : 'Fill transaction failed',
        description: isMetamaskDenied ? '' : 'You don`t have enough funds or allowance',
        duration: 3,
        iconProps: {
          type: 'close-circle',
          style: {
            color: 'red',
          },
        },
      };
      yield eff.put(sendNotificationRequest(notificationConfig));
      formActions?.resetForm({
        expirationNumber: 1,
        expirationUnit: 'months',
        shouldMatch: true,
      });
      formActions?.setSubmitting(false);
      console.log('TX FAILED', e.message);
    }
  } else {
    formActions?.resetForm({
      expirationNumber: 1,
      expirationUnit: 'months',
      shouldMatch: true,
    });
    formActions?.setSubmitting(false);
  }
  yield eff.put(setWalletState({ matchedOrders: [] }));
}

export function* postOrder({
  formActions,
  order,
  shouldMatch = true,
}) {
  const {
    takerAddress,
    makerAssetData,
    takerAssetData,
    makerAssetAmount,
    takerAssetAmount,
    expirationTimeSeconds,
    type,
  } = order;
  try {
    const web3 = ethApi.getWeb3();
    const networkId = yield eff.call(web3.eth.net.getId);
    const provider = new MetamaskSubprovider(web3.currentProvider);
    const contractWrappers = ethApi.getWrappers(networkId);
    const exchangeAddress = getContractAddressesForNetwork(networkId).exchange;

    const matched = yield eff.call(matchOrder, {
      order,
      type,
    });

    if (shouldMatch && matched.ordersToFill.length) {
      yield eff.call(fillOrder, {
        formActions,
        order,
        ...matched,
      });
    } else {
      const makerAddress = yield eff.select(selectors.getWalletState('selectedAccount'));

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
        const submitOrder = {
          salt: generatePseudoRandomSalt(),
          ...orderConfigRequest,
          ...orderConfig,
        };
        let signedOrder;
        try {
          signedOrder = yield eff.call(
            signatureUtils.ecSignOrderAsync,
            provider,
            submitOrder,
            makerAddress,
          );
          yield eff.call(
            [
              contractWrappers.exchange,
              contractWrappers.exchange.validateOrderFillableOrThrowAsync,
            ],
            transformBigNumberOrder(signedOrder),
          );
        } catch (err) {
          console.log('NOT VALID', err);
          formActions?.setFieldError(
            'balance',
            `Order validation failed: "${utils.zeroExErrToHumanReadableErrMsg(err.message)}".`,
          );
          formActions?.setSubmitting(false);
          return;
        }
        yield eff.call(api.postOrder, signedOrder, { networkId });
      } catch (err) {
        console.log('BACKEND VALIDATION', err);
        formActions?.setFieldError(
          'balance',
          err.json?.reason
            ? `Backend validation failed "${err.json.reason}".`
            : err.message.split(/[\n\r]/g)[0],
        );
        formActions?.setSubmitting(false);
        return;
      }
      formActions?.setSubmitting(false);
      formActions?.resetForm({
        expirationNumber: 1,
        expirationUnit: 'months',
        shouldMatch: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
}

export function* cancelOrder({ order }) {
  try {
    const web3 = ethApi.getWeb3();
    const networkId = yield eff.call(web3.eth.net.getId);
    const contractWrappers = ethApi.getWrappers(networkId);
    const address = yield eff.select(selectors.getWalletState('selectedAccount'));
    const txHash = yield eff.call(
      [
        contractWrappers.exchange,
        contractWrappers.exchange.cancelOrderAsync,
      ],
      order,
    );
    yield eff.fork(
      saveTransaction,
      {
        transactionHash: txHash,
        address: address.toLowerCase(),
        name: 'Cancel Order',
        networkId,
        meta: {
          makerAssetData: order.makerAssetData,
          takerAssetData: order.takerAssetData,
          orderHash: order.metaData.orderHash,
        },
      },
    );
  } catch (err) {
    console.log(err);
  }
}

export function* takePostOrder() {
  yield eff.takeEvery(actionTypes.POST_ORDER_REQUEST, postOrder);
}

export function* takeFillOrder() {
  yield eff.takeEvery(actionTypes.FILL_ORDER_REQUEST, fillOrder);
}

export function* takeCancelOrder() {
  yield eff.takeEvery(actionTypes.CANCEL_ORDER_REQUEST, cancelOrder);
}
