import {
  BigNumber,
} from '0x.js';

import {
  toBaseUnit,
} from './helpers';

/* https://github.com/Marak/faker.js/blob/master/lib/finance.js#L223 */
export function randomEthereumAddress() {
  const hexadecimalSymbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  const randomHex = Array(40).fill().map(
    () => (
      hexadecimalSymbols[Math.floor(Math.random() * hexadecimalSymbols.length)]
    ),
  );
  return `0x${randomHex.join('')}`;
}


export function generateRandomMakerAssetAmount(decimals) {
  const amount = new BigNumber(Math.round(Math.random() * 100) + 10);
  return toBaseUnit(
    amount,
    decimals,
  );
}

export function generateRandomTakerAssetAmount(decimals) {
  const amount = new BigNumber(Math.round(Math.random() * 5) + 15);
  return toBaseUnit(
    amount,
    decimals,
  );
}

export const getRandomFutureDateInSeconds = () => (
  new BigNumber(Date.now() + 1000000).div(900).ceil()
);
