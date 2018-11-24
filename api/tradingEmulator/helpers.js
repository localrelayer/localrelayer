import {
  BigNumber,
} from '0x.js';
import {
  web3Wrapper,
  contractWrappers,
} from './connector';

// Wait for all transactions mined
export const awaitTransactionsMined = (txHashes) => {
  Promise.all(txHashes.map(txHash => web3Wrapper.awaitTransactionMinedAsync(txHash)));
};

// Loads pair balances for all addresses in format:
// {
//   [address]: {
//     assetABalance: BigNumber,
//     assetBBalance: BigNumber,
//   }
// }

export const loadBalancesForPair = async (
  {
    assetA,
    assetB,
  },
  addresses,
) => addresses.reduce(async (acc, cur) => {
  const assetABalance = await contractWrappers.erc20Token.getBalanceAsync(
    assetA.tokenAddress,
    cur,
  );
  const assetBBalance = await contractWrappers.erc20Token.getBalanceAsync(
    assetB.tokenAddress,
    cur,
  );

  acc[cur] = {
    assetABalance,
    assetBBalance,
  };
  return acc;
}, {});


export const generateRandomNumber = (min, max) => BigNumber
  .random()
  .times(new BigNumber(max).minus(min)).add(min)
  .ceil();

// Randomly shuffle an array (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)

export const shuffle = (array) => {
  const newArr = [...array];
  let currentIndex = newArr.length;
  let temporaryValue; let
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = newArr[currentIndex];
    newArr[currentIndex] = newArr[randomIndex];
    newArr[randomIndex] = temporaryValue;
  }

  return newArr;
};

// Modified reduce to find first item and break

export const reduce = (array, func, acc) => {
  const result = func(acc, array[0]);
  return array.length === 0 ? acc
    : (result || reduce(array.slice(1), func, result));
};
