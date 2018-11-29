// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getAssetsWithBalanceAndAllowance,
  getFormattedWalletBalance,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import UserBalance from 'web-components/UserBalance';
import {
  coreActions,
} from 'instex-core';

type Props = {
  isTradingPage: Boolean,
}


const UserBalanceContainer = ({ isTradingPage }: Props): Node => (
  <Component
    mapStateToProps={state => ({
      assets: getAssetsWithBalanceAndAllowance(state),
      balance: getFormattedWalletBalance(state),
    })}
  >
    {({
      assets,
      balance,
      dispatch,
    }) => (
      <UserBalance
        isTradingPage={isTradingPage}
        assets={assets}
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
