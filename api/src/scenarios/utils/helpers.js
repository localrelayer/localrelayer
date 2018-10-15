import {
  BigNumber,
} from '0x.js';

export const getRandomFutureDateInSeconds = (
) => new BigNumber(Date.now() + 1000000).div(1000).ceil();
