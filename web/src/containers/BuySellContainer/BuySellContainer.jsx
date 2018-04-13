// @flow

import React from 'react';
import { connect } from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import {
  getCurrentPair,
  getCurrentToken,
  getBalance,
} from 'instex-core/selectors';
import {
  createOrder,
  fillField,
  setUiState,
} from 'instex-core/actions';
import type {
  Token,
} from 'instex-core/types';
import {
  reset,
} from 'redux-form';

import type { Dispatch } from 'redux';

import BuySell from '../../components/BuySell';
import { StyleContainer } from './styled';

type Props = {
  currentToken: Token,
  currentPair: Token,
  dispatch: Dispatch<*>,
  activeTab: string,
  isConnected: boolean,
  balance: string,
}

const BuySellContainer = ({
  currentToken,
  currentPair,
  dispatch,
  activeTab,
  isConnected,
  balance,
}: Props) => (
  <StyleContainer>
    <BuySell
      balance={balance}
      isConnected={isConnected}
      currentToken={currentToken}
      currentPair={currentPair}
      activeTab={activeTab}
      onSubmit={values => dispatch(createOrder(values))}
      fillField={(field, values) => dispatch(fillField(field, values))}
      changeActiveTab={(tab) => {
        dispatch(setUiState('activeTab', tab));
        dispatch(reset('BuySellForm'));
      }}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = (state) => {
  const { activeTab } = state.ui;
  const currentToken = getCurrentToken(state);
  const currentPair = getCurrentPair(state);
  const balance = getBalance(state);
  return {
    currentToken,
    currentPair,
    activeTab,
    balance,
    isConnected: state.profile.connectionStatus !== 'Not connected to Ethereum' && state.profile.connectionStatus !== 'Locked',
  };
};

export default connect(mapStateToProps)(BuySellContainer);
