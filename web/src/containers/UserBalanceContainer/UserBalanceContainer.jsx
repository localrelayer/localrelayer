import React from 'react';
import { connect } from 'react-redux';
import type {
  Tokens,
} from 'instex-core/types';
import {
  callContract as callContractAction,
} from 'instex-core/actions';
import UserBalance from '../../components/UserBalance';
import { StyleContainer } from './styled';

type Props = {
  tokens: Tokens,
  balance: string,
  callContract: Function,
  setAllowance: Function,
};

const UserBalanceContainer: Props = ({
  tokens,
  balance,
  callContract,
}: Tokens) => (
  <StyleContainer>
    <UserBalance
      tokens={tokens}
      onTokenClick={(...props) => console.log(...props)}
      onToggle={token => callContract({ method: 'setAllowance', token })}
      balance={balance}
      wrap={() => callContract({ method: 'deposit', contract: 'WETH' })}
      unwrap={() => callContract({ method: 'withdraw', contract: 'WETH' })}
    />
  </StyleContainer>
);

function mapStateToProps(state) {
  return {
    tokens: state.profile.tokens,
    balance: state.profile.balance,
  };
}

const mapDispatchToProps = {
  callContract: callContractAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(UserBalanceContainer);
