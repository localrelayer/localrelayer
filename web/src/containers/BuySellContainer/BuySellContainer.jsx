// @flow

import React from 'react';
import { connect } from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import {
  getCurrentPair,
  getCurrentToken,
  getProfileState,
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
  shouldAnimate: boolean,
}

const BuySellContainer = ({
  currentToken,
  currentPair,
  dispatch,
  activeTab,
  isConnected,
  balance,
  shouldAnimate,
}: Props) => (
  <StyleContainer animate={shouldAnimate}>
    <BuySell
      balance={balance}
      isConnected={isConnected}
      currentToken={currentToken}
      currentPair={currentPair}
      activeTab={activeTab}
      onSubmit={() => dispatch(createOrder())}
      fillField={(field, values) => dispatch(fillField(field, values))}
      changeActiveTab={(tab) => {
        dispatch(setUiState('activeTab', tab));
        dispatch(reset('BuySellForm'));
      }}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = (state) => {
  const { activeTab, shouldAnimate } = state.ui;
  const currentToken = getCurrentToken(state);
  const currentPair = getCurrentPair(state);
  const balance = getProfileState('balance')(state);
  return {
    currentToken,
    currentPair,
    activeTab,
    balance,
    isConnected: state.profile.connectionStatus !== 'Not connected' && state.profile.connectionStatus !== 'Locked',
    shouldAnimate,
  };
};

export default connect(mapStateToProps)(BuySellContainer);
