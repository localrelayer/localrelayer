import {
  createSelector,
} from 'reselect';
import {
  getResourceMappedList,
  getResourceMap,
} from './resources';
import {
  getUiState,
} from './ui';

export const getCurrentToken = createSelector(
  [
    getUiState('currentTokenId'),
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
    getUiState('currentPairId'),
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
    getUiState('currentPairId'),
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
    getUiState('searchQuery'),
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
