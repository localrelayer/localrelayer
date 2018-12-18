// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getAssetsWithBalanceAndAllowance,
  getUiState,
} from 'web-selectors';
import {
  uiActions,
} from 'web-actions';
import Component from 'web-components/ConnectComponent';
import Tutorial from 'web-components/Tutorial';
import {
  coreActions,
  coreSelectors as cs,
} from 'instex-core';


const TutorialContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      assets: getAssetsWithBalanceAndAllowance(state),
      balance: cs.getEthWalletBalance(state),
      etherTokenBalance: cs.getEtherTokenBalance(state),
      selectedAccount: cs.getWalletState('selectedAccount')(state),
      networkName: cs.getWalletState('networkName')(state),
      isWeb3ProviderPresent: getUiState('isWeb3ProviderPresent')(state),
      isSetupGuideVisible: getUiState('isSetupGuideVisible')(state),
    })}
  >
    {({
      balance,
      dispatch,
      isWeb3ProviderPresent,
      selectedAccount,
      networkName,
      assets,
      isSetupGuideVisible,
      etherTokenBalance,
    }) => (
      <Tutorial
        assets={assets}
        isWeb3ProviderPresent={isWeb3ProviderPresent}
        isSetupGuideVisible={isSetupGuideVisible}
        balance={balance}
        etherTokenBalance={etherTokenBalance}
        networkName={networkName}
        selectedAccount={selectedAccount}
        toggleTutorialVisible={() => (
          dispatch(uiActions.setUiState({
            isSetupGuideVisible: !isSetupGuideVisible,
          }))
        )}
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

export default TutorialContainer;
