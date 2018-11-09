import {
  BigNumber,
} from '0x.js';
import {
  ONE_SECOND_MS,
  TEN_MINUTES_MS,
} from './constants';

export const getRandomFutureDateInSeconds = (
) => new BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).ceil();
