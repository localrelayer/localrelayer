import {
  takeEvery,
  select,
  put,
} from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as types from 'instex-core/actionTypes';
import { notification, Modal, message as antMessage } from 'antd';
import { upperCaseFirst } from 'change-case';
import moment from 'moment';
import {
  getCurrentPair,
  getBuyOrders,
  getSellOrders,
  getCurrentToken,
} from 'instex-core/selectors';
import BigNumber from 'instex-core/src/utils/BigNumber';
import {
  getFormValues,
  change,
} from 'redux-form';
import DowloadMetamask from '../components/Modals/DowloadMetamask';
import NoToken from '../components/Modals/NoToken';
import InstexLogo from '../assets/instex_avatar.png';

const sagas = {
  exp: fillDate,
  price: fillPrice,
  amount: fillAmount,
};

const modals = {
  DowloadMetamask: DowloadMetamask(),
  NoToken: NoToken(),
};

export function* fillAmount({ coef, orderType }): Saga<*> {
  const pair = yield select(getCurrentPair);
  const token = yield select(getCurrentToken);

  const values = yield select(getFormValues('BuySellForm'));

  const formPrice = values ? values.price : null;
  const [lastOrder] = yield select(getSellOrders);
  // to stop division by 0
  if (!lastOrder && !formPrice && orderType === 'buy') return;

  const orderPrice = lastOrder ? lastOrder.price : 0;

  const fillValue = orderType === 'sell' ?
    BigNumber(token.balance || 0).times(coef)
    :
    BigNumber(pair.balance || 0).div(formPrice || orderPrice).times(coef);
  yield put(change('BuySellForm', 'amount', fillValue.toNumber().toFixed(8)));
}

export function* fillPrice({ orderType }) {
  const [lastOrder] = yield select(orderType === 'buy' ? getBuyOrders : getSellOrders);
  if (!lastOrder) return;
  yield put(change('BuySellForm', 'price', BigNumber(lastOrder.price).toNumber().toFixed(8)));
}

export function* fillDate({ period }) {
  yield put(change('BuySellForm', 'exp', moment().add(...period)));
}


export function* sendNotification({ payload: { type, message } }) {
  // Ignore metamask errors
  if (message.includes('MetaMask')) return;

  if (Notification.permission === 'granted') {
    new Notification(message, {
      icon: InstexLogo,
    });
  } else {
    yield notification[type]({
      message: upperCaseFirst(message),
    });
  }
}

export function* sendMessage({ payload: { type, content, destroy } }) {
  if (destroy) {
    yield antMessage.destroy();
  } else {
    yield antMessage[type](content);
  }
}

export function* showModal({
  payload: {
    title,
    type,
    text,
    name,
  },
}) {
  yield Modal[type]({
    title,
    content: modals[name] || text,
  });
}

export function* listenNotifications() {
  yield takeEvery(types.SEND_NOTIFICATION, sendNotification);
}

export function* listenMessages() {
  yield takeEvery(types.SEND_MESSAGE, sendMessage);
}

export function* listenShowModal() {
  yield takeEvery(types.SHOW_MODAL, showModal);
}

export function* listenFillField() {
  yield takeEvery(types.FILL_FIELD, ({ meta, payload }) => sagas[meta.field](payload));
}

