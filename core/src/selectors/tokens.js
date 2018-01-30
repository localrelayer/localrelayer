import { createSelector } from 'reselect';
import {
  getTokens,
  getTokensMap,
} from './resources';
import {
  getCurrentTokenId,
  getCurrentPairId,
  getSearchQuery,
} from './ui';

export const getCurrentToken = createSelector(
  getTokensMap,
  getCurrentTokenId,
  (tokensMap, currentTokenId) => {
    const currentToken = currentTokenId && tokensMap[currentTokenId];
    return currentToken ? currentToken.attributes : {};
  },
);

export const getCurrentPair = createSelector(
  getTokensMap,
  getCurrentPairId,
  (tokensMap, currentPairId) => {
    const currentToken = currentPairId && tokensMap[currentPairId];
    return currentToken ? currentToken.attributes : {};
  },
);

export const getTokensWithoutCurrentPair = createSelector(
  getTokens,
  getCurrentPairId,
  (tokens, currentId) => tokens.filter(token => token.address !== currentId),
);

export const getFilteredTokens = createSelector(
  getTokensWithoutCurrentPair,
  getSearchQuery,
  (tokens, searchQuery) =>
    tokens.filter((token) => {
      const symbol = token.symbol.toLowerCase();
      const name = token.name.toLowerCase();
      const address = token.address.toLowerCase();
      const searchQueryLower = searchQuery.toLowerCase();
      return symbol.includes(searchQueryLower) ||
      name.includes(searchQueryLower) ||
      address.includes(searchQueryLower);
    }),
);
