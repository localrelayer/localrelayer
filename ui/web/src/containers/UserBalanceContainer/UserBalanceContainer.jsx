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


const UserBalanceContainer = (): Node => (
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
        assets={assets}
        balance={balance}
        onToggle={
          (isTradable, asset) => (
            dispatch(coreActions.setApproval(isTradable, asset))
          )
        }
        deposit={amount => dispatch(coreActions.depositOrWithdrawRequest('deposit', amount))}
        withdraw={amount => dispatch(coreActions.depositOrWithdrawRequest('withdraw', amount))}
      />
    )}
  </Component>
);

export default UserBalanceContainer;
