import * as eff from 'redux-saga/effects';
import {
  coreActions,
} from 'instex-core';
import {
  uiActions,
} from 'web-actions';

function* showModal({ modalName }) {
  yield eff.put(uiActions.setUiState({
    [`is${modalName}ModalVisible`]: true,
  }));
}

export function* takeModalShow() {
  yield eff.takeEvery(
    coreActions.actionTypes.SHOW_MODAL_REQUEST,
    showModal,
  );
}
