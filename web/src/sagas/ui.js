import {
  takeEvery,
  select,
  put,
} from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as types from 'instex-core/actionTypes';
import { notification, Modal } from 'antd';
import { titleCase } from 'change-case';
import moment from 'moment';
import {
  getCurrentToken,
  getCurrentPair,
  getBuyOrders,
  getSellOrders,
  getUserTokenBy,
} from 'instex-core/selectors';
import {
  getFormValues,
  change,
} from 'redux-form';

const sagas = {
  exp: fillDate,
  price: fillPrice,
  amount: fillAmount,
};

export function* fillAmount({ orderType, coef }): Saga<*> {
  const currentToken = yield select(getCurrentToken);
  const currentPair = yield select(getCurrentPair);
  const token = yield select(getUserTokenBy('address', currentToken.address));
  const pair = yield select(getUserTokenBy('address', currentPair.address));
  const values = yield select(getFormValues('BuySellForm'));
  const formPrice = values ? values.price : null;
  const [lastOrder] = yield select(getSellOrders);
  // to not divide by 0
  if (!lastOrder && !formPrice) return;
  const orderPrice = lastOrder ? lastOrder.price : 0;
  const fillValue = orderType === 'buy' ?
    BigNumber(pair.balance).div(formPrice || orderPrice).times(coef)
    :
    BigNumber(token.balance).times(coef);
  yield put(change('BuySellForm', 'amount', fillValue.toFixed(4).toString()));
}

export function* fillPrice({ orderType }) {
  const [lastOrder] = yield select(orderType === 'buy' ? getBuyOrders : getSellOrders);
  const orderPrice = lastOrder ? lastOrder.price : 0;
  yield put(change('BuySellForm', 'price', BigNumber(orderPrice).toFixed(4).toString()));
}

export function* fillDate({ period }) {
  yield put(change('BuySellForm', 'exp', moment().add(...period)));
}


export function* sendNotification({ payload: { type, message } }) {
  // Ignore metamask errors
  if (message.includes('MetaMask')) return;
  yield notification[type]({
    message: titleCase(message),
  });
}

export function* showModal({ payload: { title, type, text } }) {
  yield Modal[type]({
    title,
    content: text,
  });
}

export function* listenNotifications() {
  yield takeEvery(types.SEND_NOTIFICATION, sendNotification);
}

export function* listenShowModal() {
  yield takeEvery(types.SHOW_MODAL, showModal);
}

export function* listenFillField() {
  yield takeEvery(types.FILL_FIELD, ({ meta, payload }) => sagas[meta.field](payload));
}

