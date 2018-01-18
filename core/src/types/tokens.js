// @flow

import type {
  ID,
} from '../types';

export type Token = {
  id: ID,
  name: string,
  symbol: string,
  percent_change_24h: string,
  price_eth: string,
  volume_eth: string,
};

export type Tokens = Array<Token>;
