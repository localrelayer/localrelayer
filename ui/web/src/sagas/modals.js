import * as eff from 'redux-saga/effects';
import {
  coreActions,
} from 'instex-core';
import {
  uiActions,
} from 'web-actions';

function* showModal() {
  yield eff.put(uiActions.setUiState({
    isOrdersInfoModalVisible: true,
  }));
}

export function* takeModalShow() {
  yield eff.takeEvery(
    coreActions.actionTypes.SHOW_ORDERS_MODAL,
    showModal,
  );
}
