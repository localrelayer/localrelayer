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
  makerAssetAmount,
  takerAssetAmount,
  type,
}) {
  // BID order wants smallest (sorted by descending order)
  // ASK order wants biggest (sorted by ascending order)
  // So we want first order

  // Order matched if

  // BID:
  // ask price < bid prices

  // ASK:
  // bid price < ask price

  // matchedOrder < orderPrice
  let price;
  let matchedOrders = [];

  if (type === 'bid') {
    price = new BigNumber(makerAssetAmount).div(takerAssetAmount);
    const askOrders = yield eff.select(selectors.getAskOrders);

    matchedOrders = askOrders.filter((askOrder) => {
      const matchedAskOrderPrice = new BigNumber(
        askOrder.metaData.remainingFillableTakerAssetAmount,
      ).div(askOrder.metaData.remainingFillableMakerAssetAmount);
      return matchedAskOrderPrice.lte(price);
    });
  } else {
    price = new BigNumber(takerAssetAmount).div(makerAssetAmount);
    const bidOrders = yield eff.select(selectors.getBidOrders);

    matchedOrders = yield eff.all(bidOrders.filter((bidOrder) => {
      const matchedBidOrderPrice = new BigNumber(
        bidOrder.metaData.remainingFillableMakerAssetAmount,
      ).div(bidOrder.metaData.remainingFillableTakerAssetAmount);
      return matchedBidOrderPrice.gte(price);
    }));
  }

  return matchedOrders;
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
  try {
    const web3 = ethApi.getWeb3();
    const networkId = yield eff.call(web3.eth.net.getId);
    const provider = new MetamaskSubprovider(web3.currentProvider);
    const contractWrappers = ethApi.getWrappers(networkId);
    const exchangeAddress = getContractAddressesForNetwork(networkId).exchange;
    const taker = yield eff.select(selectors.getWalletState('selectedAccount'));

    const matchedOrders = yield eff.call(matchOrder, {
      makerAssetAmount,
      takerAssetAmount,
      type,
    });
    let existingAssetAmount = new BigNumber(makerAssetAmount);

    if (matchedOrders.length) {
      const ordersToFill = [];
      const takerAssetFillAmounts = [];
      while (existingAssetAmount.gt(0) && matchedOrders.length) {
        const order = matchedOrders.shift();
        const neededAmount = order.metaData.remainingFillableTakerAssetAmount;
        const toBeFilledAmount = BigNumber.min(neededAmount, existingAssetAmount);
        existingAssetAmount = existingAssetAmount.minus(toBeFilledAmount);
        ordersToFill.push(order);
        takerAssetFillAmounts.push(toBeFilledAmount);
      }

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

        const filledOrders = ordersToFill.map((order, i) => ({
          makerAddress: order.makerAddress,
          orderHash: order.metaData.orderHash,
          filledAmount: takerAssetFillAmounts[i],
        }));

        const totalFilledAmount = takerAssetFillAmounts
          .reduce((acc, cur) => acc.add(cur), new BigNumber(0));
        const assets = yield eff.select(selectors.getResourceMap('assets'));
        const ordersInfo = ordersToFill[ordersToFill.length - 1];
        yield eff.fork(
          saveTransaction,
          {
            transactionHash: txHash,
            address: taker.toLowerCase(),
            name: 'Fill',
            networkId,
            meta: {
              makerAssetAmount,
              takerAssetAmount,
              totalFilledAmount,
              filledOrders,
              makerAddress,
              makerAssetData,
              takerAssetData,
              price: ordersInfo.price,
              pair: `${assets[ordersInfo.makerAssetData].symbol}/${assets[ordersInfo.takerAssetData].symbol}`,
            },
          },
        );

        if (existingAssetAmount.gt(0)) {
          const newTakerAmount = new BigNumber(takerAssetAmount)
            .times(existingAssetAmount)
            .div(makerAssetAmount);

          yield eff.call(postOrder, {
            formActions,
            order: {
              makerAddress,
              takerAddress,
              makerAssetData,
              takerAssetData,
              makerAssetAmount: existingAssetAmount,
              takerAssetAmount: newTakerAmount,
              expirationTimeSeconds,
              type,
            },
          });
        }
      } catch (e) {
        console.log('TX FAILED', e);
      }
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
        try {
          yield eff.call(
            [
              contractWrappers.exchange,
              contractWrappers.exchange.validateOrderFillableOrThrowAsync,
            ],
            transformBigNumberOrder(signedOrder),
          );
        } catch (err) {
          console.log('NOT VALID', err);
          formActions.setFieldError(
            'balance',
            'Order validation failed',
          );
          formActions.setSubmitting(false);
          return;
        }
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
  } catch (e) {
    console.log(e);
  }
  formActions.setSubmitting(false);
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

export function* takeCancelOrder() {
  yield eff.takeEvery(actionTypes.CANCEL_ORDER_REQUEST, cancelOrder);
}
