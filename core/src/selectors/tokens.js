import {
  createSelector,
} from 'reselect';
import {
  getResourceMappedList,
  getResourceMap,
} from './resources';
import {
  getCurrentTokenId,
  getCurrentPairId,
  getSearchQuery,
} from './ui';


export const getCurrentToken = createSelector(
  [
    getCurrentTokenId,
    getResourceMap('tokens'),
  ],
  (id, tokens) => (id ? ({
    ...tokens[id].attributes,
    ...tokens[id].relations,
    id,
  }) : {}),
);

export const getCurrentPair = createSelector(
  [
    getCurrentPairId,
    getResourceMap('tokens'),
  ],
  (id, tokens) => (id ? ({
    ...tokens[id].attributes,
    ...tokens[id].relations,
    id,
  }) : {}),
);

export const getTokensWithoutCurrentPair = createSelector(
  [
    getResourceMappedList('tokens', 'allTokens'),
    getCurrentPairId,
  ],
  (tokens, currentId) => tokens.filter(token => token.id !== currentId && token.is_listed),
);

export const getWethToken = createSelector(
  [
    getResourceMappedList('tokens', 'allTokens'),
  ],
  tokens => tokens.find(token => token.symbol === 'WETH' && token.is_listed),
);

export const getFilteredTokens = createSelector(
  [
    getTokensWithoutCurrentPair,
    getSearchQuery,
  ],
  (
    tokens,
    searchQuery = '',
  ) =>
    tokens.filter((token) => {
      const {
        symbol = '',
        name = '',
      } = token;
      const address = token.id;
      const searchQueryLower = searchQuery.toLowerCase();
      const nameLower = name.toLowerCase();
      const symbolLower = symbol.toLowerCase();
      return symbolLower.includes(searchQueryLower) ||
      nameLower.includes(searchQueryLower) ||
      address.includes(searchQueryLower);
    }),
);
