// @flow
import * as eff from 'redux-saga/effects';

import * as walletActions from '../actions/wallet';
import ethApi from '../ethApi';


export function* watchWallet({
  delay,
  tokens,
}): Saga<void> {
  const ethNetworks = {
    1: 'Main Ethereum Network',
    42: 'Kovan Test Network',
  };

  while (true) {
    const web3 = ethApi.getWeb3();
    const {
      networkId,
      accounts,
    } = yield eff.all({
      networkId: eff.call(web3.eth.net.getId),
      /*
       * metamask always return only single account
       * https://github.com/MetaMask/metamask-extension/issues/3207
      */
      accounts: eff.call(web3.eth.getAccounts),
    });
    const contractWrappers = ethApi.getWrappers(networkId);

    const selectedAccount = accounts.length ? accounts[0] : null;
    const selectedAccountBalance = (
      accounts.length ? yield eff.call(web3.eth.getBalance, accounts[0]) : null
    );
    const balance = yield eff.all(
      tokens.reduce(
        (acc, tokenAddress) => ({
          ...acc,
          [tokenAddress]: eff.call(
            [contractWrappers.erc20Token, contractWrappers.erc20Token.getBalanceAsync],
            tokenAddress,
            selectedAccount,
          ),
        }),
        {},
      ),
    );

    const changedData = [];
    const wallet = yield eff.select(s => s.wallet);
    if (wallet.networkId !== networkId) {
      changedData.push({
        networkId,
        networkName: ethNetworks[networkId] || 'Unknown',
      });
    }
    if (accounts.some((w, i) => wallet.accounts[i] !== w)) {
      changedData.push({
        accounts,
      });
    }
    if (selectedAccount !== wallet.selectedAccount) {
      changedData.push({
        selectedAccount,
      });
    }
    if (selectedAccountBalance !== wallet.selectedAccountBalance) {
      changedData.push({
        selectedAccountBalance,
      });
    }
    changedData.push({
      balance,
    });

    if (changedData.length) {
      yield eff.put(
        walletActions.setWalletState(
          changedData.reduce(
            (acc, data) => ({
              ...acc,
              ...data,
            }),
            {},
          ),
          [
            'balance',
          ],
        ),
      );
    }
    yield eff.delay(delay);
  }
}
