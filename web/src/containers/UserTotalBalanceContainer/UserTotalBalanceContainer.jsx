// @flow

import React from 'react';
import { connect } from 'react-redux';
import type {
  Tokens,
} from 'instex-core/types';
import type { MapStateToProps } from 'react-redux';
import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import {
  setUiState,
} from 'instex-core/actions';
import {
  getResourceMappedList,
} from 'instex-core/selectors';
import UserTotalBalance from '../../components/UserTotalBalance';
import { StyleContainer } from './styled';

type Props = {
  tokens: Tokens,
  balance: string,
  dispatch: Dispatch,
  isBalanceLoading: boolean,
  lockedBalance: string,
  isConnected: boolean,
};

const UserTotalBalanceContainer: StatelessFunctionalComponent<Props> = ({
  tokens,
  balance,
  dispatch,
  isBalanceLoading,
  lockedBalance,
  isConnected,
}: Props): Node => (
  <StyleContainer>
    <UserTotalBalance
      isBalanceLoading={isBalanceLoading}
      tokens={tokens}
      onToggle={(checked, token) => {
      if (checked) {
        dispatch(setUiState('activeModal', 'GasModal'));
        dispatch(setUiState('onGasOk', { action: 'callContract', args: ['setAllowance', token] }));
      } else {
        dispatch(setUiState('activeModal', 'GasModal'));
        dispatch(setUiState('onGasOk', { action: 'callContract', args: ['unsetAllowance', token] }));
      }
    }}
      balance={balance}
      wrap={() => {
      dispatch(setUiState('activeModal', 'GasModal'));
      dispatch(setUiState('onGasOk', { action: 'callContract', args: ['deposit'] }));
    }}
      unwrap={() => {
      dispatch(setUiState('activeModal', 'GasModal'));
      dispatch(setUiState('onGasOk', { action: 'callContract', args: ['withdraw'] }));
    }}
      lockedBalance={lockedBalance}
      isConnected={isConnected}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  tokens: getResourceMappedList('tokens', 'allTokens')(state),
  balance: state.profile.balance,
  isBalanceLoading: state.ui.isBalanceLoading,
  isConnected: state.profile.connectionStatus !== 'Not connected to Ethereum' && state.profile.connectionStatus !== 'Locked',
});

export default connect(mapStateToProps)(UserTotalBalanceContainer);
