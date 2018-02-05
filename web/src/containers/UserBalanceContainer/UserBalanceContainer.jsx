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
  callContract,
} from 'instex-core/actions';
import UserBalance from '../../components/UserBalance';
import { StyleContainer } from './styled';

type Props = {
  tokens: Tokens,
  balance: string,
  dispatch: Dispatch,
  isBalanceLoading: boolean,
};

const UserBalanceContainer: StatelessFunctionalComponent<Props> = ({
  tokens,
  balance,
  dispatch,
  isBalanceLoading,
}: Props): Node => (
  <StyleContainer>
    <UserBalance
      isBalanceLoading={isBalanceLoading}
      tokens={tokens}
      onToggle={token => dispatch(callContract('setAllowance', token))}
      balance={balance}
      wrap={() => dispatch(callContract('deposit'))}
      unwrap={() => dispatch(callContract('withdraw'))}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  tokens: state.profile.tokens,
  balance: state.profile.balance,
  isBalanceLoading: state.ui.isBalanceLoading,
});

export default connect(mapStateToProps)(UserBalanceContainer);
