// @flow

import React from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import * as actions from 'instex-core/actions';
import {
  getCurrentToken,
  getCurrentPair,
  isTransactionPending,
} from 'instex-core/selectors';
import type { Token } from 'instex-core/types';
import type { Dispatch } from 'redux';
import GasModal from '../components/Modals/GasModal';
import AllowanceModal from '../components/Modals/AllowanceModal';
import TxModal from '../components/Modals/TxModal';
import WrapModal from '../components/Modals/WrapModal';

type Props = {
  activeModal: string,
  dispatch: Dispatch<*>,
  token: Token,
  txHash: string,
  wrapAmount: string,
  onGasOk: Object,
  onTxOk: Object,
  isTxLoading: boolean,
};

const ModalWrapper = ({
  activeModal,
  dispatch,
  token,
  txHash,
  wrapAmount,
  onGasOk,
  onTxOk,
  isTxLoading,
}: Props) => (
  <div>
    <AllowanceModal
      activeModal={activeModal}
      onOk={() => {
        dispatch(actions.setUiState('activeModal', 'GasModal'));
        dispatch(actions.setUiState('onGasOk', { action: 'callContract', args: ['setAllowance', token] }));
      }}
      onCancel={() => dispatch(actions.setUiState('activeModal', ''))}
      token={token}
    />
    <WrapModal
      activeModal={activeModal}
      onOk={() => {
        dispatch(change('WrapForm', 'amount', wrapAmount)); // eslint-disable-line
        dispatch(actions.setUiState('activeModal', 'GasModal'));
        dispatch(actions.setUiState('onGasOk', { action: 'callContract', args: ['deposit'] }));
      }}
      onCancel={() => dispatch(actions.setUiState('activeModal', ''))}
    />
    <TxModal
      activeModal={activeModal}
      txHash={txHash}
      isTxLoading={onTxOk && isTxLoading}
      onCancel={() => {
        dispatch(actions.setUiState('activeModal', ''));
        dispatch(actions.setUiState('onTxOk', null));
        dispatch(actions.setUiState('txHash', null));
      }}
      onOk={() => {
        if (onTxOk) {
          dispatch(actions[onTxOk.action](...onTxOk.args));
        }
        dispatch(actions.setUiState('onTxOk', null));
        dispatch(actions.setUiState('txHash', null));
      }}
    />
    {activeModal === 'GasModal' && <GasModal
      activeModal={activeModal}
      isTxLoading={onGasOk && isTxLoading}
      onCancel={() => {
        dispatch(actions.setUiState('activeModal', ''));
        dispatch(actions.setUiState('onGasOk', null));
      }}
      onOk={() => {
        if (onGasOk) {
          dispatch(actions[onGasOk.action](...onGasOk.args));
        }
        dispatch(actions.setUiState('onGasOk', null));
      }}
    />}
  </div>
);

const mapStateToProps = (state) => {
  const {
    activeModal,
    txHash,
    wrapAmount,
    activeTab,
    onGasOk,
    onTxOk,
  } = state.ui;

  const token = activeTab === 'buy' ? getCurrentPair(state) : getCurrentToken(state);
  return {
    activeModal,
    txHash,
    wrapAmount,
    token,
    onGasOk,
    onTxOk,
    isTxLoading: isTransactionPending(state),
  };
};

export default connect(mapStateToProps)(ModalWrapper);
