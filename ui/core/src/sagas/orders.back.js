import {
  takeEvery,
  select,
  put,
  call,
  cps,
  all,
} from 'redux-saga/effects';
import createActionCreators from 'redux-resource-action-creators';
import type { Saga } from 'redux-saga';
import { ZeroEx } from '0x.js';
import moment from 'moment';
import {
  reset,
  getFormValues,
} from 'redux-form';
import * as types from '../actions/types';
import {
  getCurrentToken,
  getCurrentPair,
  getUiState,
  getProfileState,
  getResourceItemBydId,
} from '../selectors';
import {
  sendNotification,
  saveResourceRequest,
  sendMessage,
  setUiState,
  showModal,
} from '../actions';
import {
  NODE_ADDRESS, SMALLEST_AMOUNT,
} from '../utils/web3';
import * as resourcesActions from '../actions/resources';
import {
  loadTokensBalance, loadCurrentTokenAndPairBalance,
} from './profile';
import config from '../config';
import {
  customApiRequest,
} from '../api';
import {
  trackMixpanel,
} from '../utils/mixpanel';
import BigNumber from '../utils/BigNumber';
import {
  throwError,
} from './utils';

export function* createOrder(): Saga<*> {
  const { zeroEx } = window;
  const EXCHANGE_ADDRESS = yield zeroEx.exchange.getContractAddress();
  const { amount, price } = yield select(getFormValues('BuySellForm'));
  const type = yield select(getUiState('activeTab'));
  const exp = moment().add('1', 'year');
  const balance = yield select(getProfileState('balance'));
  const address = yield select(getProfileState('address'));
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  const total = BigNumber(price).times(amount).toFixed(12).toString();

  let makerTokenAddress;
  let takerTokenAddress;
  let makerTokenAmount;
  let takerTokenAmount;

  if (type === 'sell') {
    // Check allowance for token

    const allowance = yield call(
      [zeroEx.token, zeroEx.token.getProxyAllowanceAsync],
      currentToken.id,
      address,
    );

    if (allowance.eq(0)) {
      yield put(setUiState('activeModal', 'AllowanceModal'));
      yield put(setUiState('onTxOk', { action: 'createOrder', args: [] }));
      return;
    }

    makerTokenAddress = currentToken.id;
    takerTokenAddress = currentPair.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(amount), currentToken.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(total), currentPair.decimals);
  } else if (type === 'buy') {
    // Check wrapped amount for WETH

    if (currentPair.symbol === 'WETH' && currentPair.is_listed) {
      if (BigNumber(currentPair.balance).lt(total) && BigNumber(balance).gt(total)) {
        yield put(setUiState('activeModal', 'WrapModal'));
        yield put(setUiState('wrapAmount', BigNumber(total).minus(currentPair.balance)));
        yield put(setUiState('onTxOk', { action: 'createOrder', args: [] }));
        return;
      }
    }

    // Check allowance for pair

    const allowance = yield call(
      [zeroEx.token, zeroEx.token.getProxyAllowanceAsync],
      currentPair.id,
      address,
    );

    if (allowance.eq(0)) {
      yield put(setUiState('activeModal', 'AllowanceModal'));
      yield put(setUiState('onTxOk', { action: 'createOrder', args: [] }));
      return;
    }

    makerTokenAddress = currentPair.id;
    takerTokenAddress = currentToken.id;
    makerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(total), currentPair.decimals);
    takerTokenAmount =
      ZeroEx.toBaseUnitAmount(BigNumber(amount), currentToken.decimals);
  }
  const zrxOrder = {
    maker: address.toLowerCase(),
    taker: NODE_ADDRESS,
    feeRecipient: '0x004e344251110fa1cb09aa31c95c6598ed07dce6',
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: BigNumber(0),
    takerFee: BigNumber(0),
    makerTokenAddress: makerTokenAddress.toLowerCase(),
    takerTokenAddress: takerTokenAddress.toLowerCase(),
    makerTokenAmount,
    takerTokenAmount,
    expirationUnixTimestampSec: BigNumber(exp.unix()),
  };

  const orderHash = ZeroEx.getOrderHashHex(zrxOrder);

  try {
    const order = {
      price: (+price).toFixed(12),
      amount: (+amount).toFixed(12),
      total: (+total).toFixed(12),
      token_address: currentToken.id,
      pair_address: currentPair.id,
      type,
      zrxOrder,
      expires_at: exp.toISOString(),
      maker_address: address,
      order_hash: orderHash,
    };

    const { matchedOrders } = yield call(customApiRequest, {
      url: `${config.apiUrl}/orders/match`,
      method: 'POST',
      body: JSON.stringify({
        order,
      }),
    });

    let txHash;

    if (matchedOrders.length) {
      const signedOrders = matchedOrders.map(o => formatZrxOrder(o.zrxOrder));

      // Get filled amount
      const matchedOrdersFillment = yield all(
        matchedOrders.map(async o =>
          zeroEx.exchange.getUnavailableTakerAmountAsync(o.order_hash)),
      );

      txHash = yield call(
        [zeroEx.exchange, zeroEx.exchange.fillOrdersUpToAsync],
        signedOrders,
        BigNumber(zrxOrder.makerTokenAmount),
        true,
        address,
      );

      const matchedOrdersTotalTakerAmount = signedOrders
        .reduce(
          (prev, cur, i) => prev.add(cur.takerTokenAmount.minus(matchedOrdersFillment[i])),
          BigNumber(0),
        );

      const matchedOrdersTotalMakerAmount = signedOrders
        .reduce((prev, cur, i) => {
          const orderTakerAmount = cur.takerTokenAmount.minus(matchedOrdersFillment[i]);
          const orderMakerAmount = (BigNumber(cur.makerTokenAmount).times(orderTakerAmount))
            .div(cur.takerTokenAmount).toFixed(0);
          return prev.add(orderMakerAmount);
        },
        BigNumber(0));

      const leftTakerAmount = BigNumber(zrxOrder.takerTokenAmount)
        .minus(matchedOrdersTotalMakerAmount);
      const leftMakerAmount = BigNumber(zrxOrder.makerTokenAmount)
        .minus(matchedOrdersTotalTakerAmount);

      const isFilled = BigNumber(leftTakerAmount).lte(SMALLEST_AMOUNT);

      const takerDecimals = order.type === 'buy' ? currentToken.decimals : currentPair.decimals;
      const makerDecimals = order.type === 'buy' ? currentPair.decimals : currentToken.decimals;

      const leftMakerAmountUnit = ZeroEx.toUnitAmount(
        BigNumber(leftMakerAmount).isNegative() ? BigNumber(0) : BigNumber(leftMakerAmount),
        makerDecimals,
      );

      const leftTakerAmountUnit = ZeroEx.toUnitAmount(
        BigNumber(leftTakerAmount).isNegative() ? BigNumber(0) : BigNumber(leftTakerAmount),
        takerDecimals,
      );

      // Create a new order with left amount
      if (!isFilled) {
        // calculate new total and amount
        const newAmount = order.type === 'buy' ? leftTakerAmountUnit : leftMakerAmountUnit;
        const newTotal = BigNumber(newAmount).times(order.price);

        const newOrder = {
          ...order,
          amount: newAmount.toFixed(12),
          total: newTotal.toFixed(12),
          zrxOrder: {
            ...order.zrxOrder,
            makerTokenAmount: leftMakerAmount,
            takerTokenAmount: leftTakerAmount,
          },
        };

        const newOrderHash = ZeroEx.getOrderHashHex(newOrder.zrxOrder);
        try {
          const signedZRXOrder = yield call(signOrder, newOrder.zrxOrder, newOrderHash);
          newOrder.zrxOrder = signedZRXOrder;
          yield put(sendMessage({ content: 'Placing order', type: 'loading' }));

          yield put(saveResourceRequest({
            resourceName: 'orders',
            request: 'createOrder',
            lists: ['userOrders', type],
            data: {
              attributes: newOrder,
              resourceName: 'orders',
            },
          }));
        } catch (e) {
          console.log(e.message);
        }
      }

      const filledTakerAmountUnit = isFilled ?
        ZeroEx.toUnitAmount(
          BigNumber(zrxOrder.takerTokenAmount), takerDecimals,
        )
        :
        ZeroEx.toUnitAmount(
          BigNumber(zrxOrder.takerTokenAmount), takerDecimals,
        ).minus(leftTakerAmountUnit);

      const filledMakerAmountUnit = isFilled ?
        ZeroEx.toUnitAmount(
          BigNumber(zrxOrder.makerTokenAmount), makerDecimals,
        )
        :
        ZeroEx.toUnitAmount(
          BigNumber(zrxOrder.makerTokenAmount), makerDecimals,
        ).minus(leftMakerAmountUnit);

      const filledAmount = order.type === 'buy' ? filledTakerAmountUnit : filledMakerAmountUnit;
      const filledTotal = BigNumber(filledAmount).times(order.price);

      const orderAttributes = {
        ...order,
        amount: filledAmount.toFixed(12),
        total: filledTotal.toFixed(12),
      };

      if (txHash) {
        yield put(setUiState('activeModal', 'TxModal'));
        yield put(setUiState('txHash', txHash));
      }

      // Updating orders after transaction
      yield call(customApiRequest, {
        url: `${config.apiUrl}/orders/update`,
        method: 'POST',
        body: JSON.stringify({
          matchedOrders,
          orderAttributes,
          txHash,
        }),
      });
    } else {
      const signedZRXOrder = yield call(signOrder, zrxOrder, orderHash);
      order.zrxOrder = signedZRXOrder;
      yield put(sendMessage({ content: 'Placing order', type: 'loading' }));

      yield put(saveResourceRequest({
        resourceName: 'orders',
        request: 'createOrder',
        lists: ['userOrders', type],
        data: {
          attributes: order,
          resourceName: 'orders',
        },
      }));
    }

    trackMixpanel(
      'Order created',
      { address, token: currentToken.id },
    );
  } catch (e) {
    yield call(throwError, e);
    yield put(sendNotification({ message: e.message, type: 'error' }));
    console.error(e);
  } finally {
    yield put(reset('BuySellForm'));
    yield call(loadCurrentTokenAndPairBalance);
  }
}

function* signOrder(zrxOrder, orderHash): Saga<*> {
  const { zeroEx } = window;
  const address = yield select(getProfileState('address'));
  const provider = yield select(getProfileState('provider'));

  if (provider === 'ledger') {
    yield put(showModal({
      title: 'Ledger action required',
      type: 'info',
      text: 'Confirm transaction on your Ledger',
    }));
  }

  const ecSignature = yield zeroEx.signOrderHashAsync(orderHash, address, provider === 'metamask');
  const signedZRXOrder = {
    ...zrxOrder,
    ecSignature,
  };
  yield zeroEx.exchange.validateOrderFillableOrThrowAsync(signedZRXOrder);
  return signedZRXOrder;
}

export function* loadOrders(): Saga<*> {
  const currentToken = yield select(getCurrentToken);
  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'buy',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        limitCondition: {
          limit: 50,
        },
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'child_id': null,
            'canceled_at': null,
            'status': 'new',
            'deleted_at': null,
            'type': 'buy',
          },
        },
        sortBy: '-price',
      },
    }),
  );

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'sell',
      request: 'fetchOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        limitCondition: {
          limit: 50,
        },
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'completed_at': null,
            'child_id': null,
            'canceled_at': null,
            'deleted_at': null,
            'status': 'new',
            'type': 'sell',
          },
        },
        sortBy: 'price',
      },
    }),
  );

  yield put(
    resourcesActions.fetchResourcesRequest({
      resourceName: 'orders',
      list: 'completedOrders',
      request: 'fetchCompletedOrders',
      withDeleted: false,
      mergeListIds: false,
      fetchQuery: {
        limitCondition: {
          limit: 500,
        },
        filterCondition: {
          filter: {
            'token.address': {
              eq: currentToken.id,
            },
            'is_history': true,
            'canceled_at': null,
            'deleted_at': null,
            'completed_at': {
              'ne': null,
            },
          },
        },
        sortBy: '-created_at',
      },
    }),
  );
}

export function* cancelOrder({
  orderId,
}: {
  orderId: string,
}) {
  const { zeroEx } = window;
  try {
    const actions = createActionCreators('delete', {
      resourceType: 'orders',
      request: 'cancelOrder',
    });
    yield put(actions.pending());
    const account = yield select(getProfileState('address'));
    const provider = yield select(getProfileState('provider'));
    const order = yield select(getResourceItemBydId('orders', orderId));

    let signature;

    if (provider === 'ledger') {
      yield put(showModal({
        title: 'Ledger action required',
        type: 'info',
        text: 'Confirm transaction on your Ledger',
      }));
      signature = yield call([
        window.ledgerSubprovider,
        window.ledgerSubprovider.signPersonalMessageAsync,
      ],
      window.web3Instance.utils.toHex('Confirmation to cancel order'),
      account);
    } else {
      signature = yield cps(
        window.web3Instance.eth.personal.sign,
        'Confirmation to cancel order',
        account,
      );
    }
    yield call(
      [zeroEx.exchange, zeroEx.exchange.cancelOrderAsync],
      formatZrxOrder(order.attributes.zrxOrder),
      BigNumber(order.attributes.zrxOrder.takerTokenAmount),
    );

    yield call(customApiRequest, {
      url: `${config.apiUrl}/orders/${orderId}/cancel`,
      method: 'POST',
      body: JSON.stringify({
        signature,
      }),
    });
    yield put(actions.succeeded({
      resources: [orderId],
    }));
    yield call(loadTokensBalance);
  } catch (err) {
    yield call(throwError, err);
    yield put(sendNotification({ message: err.message, type: 'error' }));
  }
}

export const formatZrxOrder = order => ({
  ...order,
  makerTokenAmount: BigNumber(order.makerTokenAmount),
  takerTokenAmount: BigNumber(order.takerTokenAmount),
  expirationUnixTimestampSec: BigNumber(order.expirationUnixTimestampSec),
  makerFee: BigNumber(order.makerFee),
  takerFee: BigNumber(order.takerFee),
});

export function* listenNewOrder(): Saga<*> {
  yield takeEvery(types.CREATE_ORDER, action => createOrder(action.payload));
}

export function* listenCancelOrder(): Saga<*> {
  yield takeEvery(types.CANCEL_ORDER, cancelOrder);
}
