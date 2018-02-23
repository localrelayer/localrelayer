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
  const currentPair = yield select(getCurrentPair);
  const pair = yield select(getUserTokenBy('id', currentPair.id));
  const values = yield select(getFormValues('BuySellForm'));

  const formPrice = values ? values.price : null;
  const [lastOrder] = yield select(getSellOrders);
  // to stop division by 0
  if (!lastOrder && !formPrice) return;

  const orderPrice = lastOrder ? lastOrder.price : 0;

  const fillValue = BigNumber(pair.balance).div(formPrice || orderPrice).times(coef);
  yield put(change('BuySellForm', 'amount', fillValue.toNumber().toFixed(6)));
}

export function* fillPrice({ orderType }) {
  const [lastOrder] = yield select(orderType === 'buy' ? getBuyOrders : getSellOrders);
  if (!lastOrder) return;
  yield put(change('BuySellForm', 'price', BigNumber(lastOrder.price).toNumber().toFixed(6)));
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

