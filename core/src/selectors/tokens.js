import {
  createSelector,
} from 'reselect';
import {
  getResourceMap,
  getResourceMappedList,
} from './resources';
import {
  getCurrentTokenId,
  getCurrentPairId,
  getSearchQuery,
} from './ui';


export const getCurrentToken = createSelector(
  [
    getResourceMap('tokens'),
    getCurrentTokenId,
  ],
  (
    tokensMap,
    currentTokenId,
  ) => {
    const currentToken = currentTokenId && tokensMap[currentTokenId];
    return currentToken ? currentToken.attributes : {};
  },
);

export const getCurrentPair = createSelector(
  [
    getResourceMap('tokens'),
    getCurrentPairId,
  ],
  (
    tokensMap,
    currentPairId,
  ) => {
    const currentToken = currentPairId && tokensMap[currentPairId];
    return currentToken ? currentToken.attributes : {};
  },
);

export const getTokensWithoutCurrentPair = createSelector(
  [
    getResourceMappedList('tokens', 'allTokens'),
    getCurrentPairId,
  ],
  (tokens, currentId) => tokens.filter(token => token.address !== currentId),
);

export const getFilteredTokens = createSelector(
  [
    getTokensWithoutCurrentPair,
    getSearchQuery,
  ],
  (
    tokens,
    searchQuery,
  ) =>
    tokens.filter((token) => {
      const {
        symbol,
        name,
      } = token;
      const address = token.id;
      const searchQueryLower = searchQuery;
      return symbol.includes(searchQueryLower) ||
      name.includes(searchQueryLower) ||
      address.includes(searchQueryLower);
    }),
);
