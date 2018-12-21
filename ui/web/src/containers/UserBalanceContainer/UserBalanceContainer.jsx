// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getAssetsWithBalanceAndAllowance,
  getUiState,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import UserBalance from 'web-components/UserBalance';
import {
  coreActions,
  coreSelectors as cs,
} from 'instex-core';

type Props = {
  isTradingPage: Boolean,
}


const UserBalanceContainer = ({ isTradingPage }: Props): Node => (
  <Component
    mapStateToProps={state => ({
      assets: getAssetsWithBalanceAndAllowance(state),
      balance: cs.getEthWalletBalance(state),
      isWeb3ProviderPresent: getUiState('isWeb3ProviderPresent')(state),
      isNetworkSupported: getUiState('isNetworkSupported')(state),
    })}
  >
    {({
      assets,
      balance,
      dispatch,
      isWeb3ProviderPresent,
      isNetworkSupported,
    }) => (
      <UserBalance
        isTradingPage={isTradingPage}
        assets={assets}
        isWeb3ProviderPresent={isWeb3ProviderPresent}
        isNetworkSupported={isNetworkSupported}
        balance={balance}
        onToggleTradable={
          (isTradable, asset) => (
            dispatch(coreActions.setApprovalRequest(isTradable, asset))
          )
        }
        onDeposit={
          (amount, formActions) => dispatch(
            coreActions.depositOrWithdrawRequest('deposit', amount, formActions),
          )
        }
        onWithdraw={
          (amount, formActions) => dispatch(
            coreActions.depositOrWithdrawRequest('withdraw', amount, formActions),
          )
        }
      />
    )}
  </Component>
);

export default UserBalanceContainer;
