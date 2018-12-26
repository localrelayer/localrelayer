// @flow
import {
  createSelector,
} from 'reselect';

import {
  getResourceMap,
} from './resources';


export const getTokenPrice = (symbol = 'WETH') => createSelector(
  [
    getResourceMap('marketQuotes'),
  ],
  marketQuotes => marketQuotes[symbol] && marketQuotes[symbol].quote.USD.price,
);
