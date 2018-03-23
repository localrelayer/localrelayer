// @flow

import React from 'react';
import { connect } from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import {
  getCurrentPair,
  getCurrentToken,
  getUserTokenBy,
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
}

const BuySellContainer = ({
  currentToken,
  currentPair,
  dispatch,
  activeTab,
  isConnected,
}: Props) => (
  <StyleContainer>
    <BuySell
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
  return {
    // We need to get current token and pair from profile to get a balance
    currentToken: getUserTokenBy('id', currentToken.id)(state),
    currentPair: getUserTokenBy('id', currentPair.id)(state),
    activeTab,
    isConnected: state.profile.connectionStatus !== 'Not connected to Ethereum' && state.profile.connectionStatus !== 'Locked',
  };
};

export default connect(mapStateToProps)(BuySellContainer);
