// @flow

import type { ID } from '../types';

export type Token = {
  id: ID,
  symbol: string,
  tradingPair: string,
  highPrice: string,
  lowPrice: string,
  tradingVolume: number,
  change24Hour: number,
  lastPrice: string,
  name: string,
  address: string,
};

export type Tokens = Array<Token>;
