// @flow
import * as eff from 'redux-saga/effects';
import * as R from 'ramda';
import * as utils from '../utils';
import * as walletActions from '../actions/wallet';
import ethApi from '../ethApi';
import {
  fetchUserOrders,
  fetchUserTradingHistory,
} from './orders';


export function* watchWallet({
  delay,
  tokens,
}): Saga<void> {
  while (true) {
    try {
      const web3 = ethApi.getWeb3();
      const {
        networkId,
        accounts,
      } = yield eff.all({
        networkId: web3 ? eff.call(web3.eth.net.getId) : 1,
        /*
         * metamask always return only single account
         * https://github.com/MetaMask/metamask-extension/issues/3207
        */
        accounts: web3 ? eff.call(web3.eth.getAccounts) : [],
      });

      const selectedAccount = accounts.length ? accounts[0].toLowerCase() : null;
      if (selectedAccount) {
        const contractWrappers = ethApi.getWrappers(networkId);

        const selectedAccountBalance = (
          accounts.length
            ? (
              yield eff.call(web3.eth.getBalance, selectedAccount)
            ) : null
        );
        const balance = yield eff.all(
          tokens.reduce(
            (acc, tokenAddress) => ({
              ...acc,
              [tokenAddress]: (
                contractWrappers.erc20Token.getBalanceAsync(
                  tokenAddress,
                  selectedAccount,
                ).then(b => b.toString())
              ),
            }),
            {},
          ),
        );

        const allowance = yield eff.all(
          tokens.reduce(
            (acc, tokenAddress) => ({
              ...acc,
              [tokenAddress]: (
                contractWrappers.erc20Token.getProxyAllowanceAsync(
                  tokenAddress,
                  selectedAccount,
                ).then(b => b.toString())
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
            networkName: utils.getNetwork(networkId).name,
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
          yield eff.fork(
            fetchUserOrders,
            {
              networkId,
              traderAddress: selectedAccount,
            },
          );
          yield eff.fork(
            fetchUserTradingHistory,
            {
              networkId,
              makerAddress: selectedAccount,
            },
          );
        }

        if (selectedAccountBalance && selectedAccountBalance !== wallet.selectedAccountBalance) {
          changedData.push({
            selectedAccountBalance,
          });
        }

        if (!R.equals(wallet.balance, balance)) {
          changedData.push({
            balance: {
              _merge: true,
              ...balance,
            },
          });
        }

        if (!R.equals(wallet.allowance, allowance)) {
          changedData.push({
            allowance: {
              _merge: true,
              ...allowance,
            },
          });
        }

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
            ),
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
    yield eff.delay(delay);
  }
}

export function* getWalletBalance(tokens): Saga<void> {
  const web3 = ethApi.getWeb3();
  const {
    networkId,
    accounts,
  } = yield eff.all({
    networkId: web3 ? eff.call(web3.eth.net.getId) : 1,
    accounts: web3 ? eff.call(web3.eth.getAccounts) : [],
  });
  const contractWrappers = ethApi.getWrappers(networkId);
  return yield eff.all(
    Object.values(tokens).reduce(
      (acc, tokenAddress) => ({
        ...acc,
        [tokenAddress]: (
          contractWrappers.erc20Token.getBalanceAsync(
            tokenAddress,
            accounts[0],
          ).then(b => b.toString())
        ),
      }),
      {},
    ),
  );
}
