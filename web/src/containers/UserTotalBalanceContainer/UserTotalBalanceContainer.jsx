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
};

const UserTotalBalanceContainer: StatelessFunctionalComponent<Props> = ({
  tokens,
  balance,
  dispatch,
  isBalanceLoading,
  lockedBalance,
}: Props): Node => (
  <StyleContainer>
    <UserTotalBalance
      isBalanceLoading={isBalanceLoading}
      tokens={tokens}
      onToggle={token => dispatch(callContract('setAllowance', token))}
      balance={balance}
      wrap={() => dispatch(callContract('deposit'))}
      unwrap={() => dispatch(callContract('withdraw'))}
      lockedBalance={lockedBalance}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  tokens: getResourceMappedList('tokens', 'allTokens')(state),
  balance: state.profile.balance,
  isBalanceLoading: state.ui.isBalanceLoading,
});

export default connect(mapStateToProps)(UserTotalBalanceContainer);
