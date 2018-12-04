import * as eff from 'redux-saga/effects';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

import ethApi from '../ethApi';


export function* saveTransaction(txHash) {
  const web3 = ethApi.getWeb3();
  const web3Wrapper = new Web3Wrapper(web3.currentProvider);
  console.log('→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→');
  const tr = yield eff.call(
    [
      web3Wrapper,
      web3Wrapper.awaitTransactionMinedAsync,
    ],
    txHash,
  );
  console.log(tr);
  console.log('←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←');
}

export function* awaitTransaction(txHash) {
  const web3 = ethApi.getWeb3();
  const web3Wrapper = new Web3Wrapper(web3.currentProvider);
  console.log('→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→→');
  const tr = yield eff.call(
    [
      web3Wrapper,
      web3Wrapper.awaitTransactionMinedAsync,
    ],
    txHash,
  );
  console.log(tr);
  console.log('←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←');
}
