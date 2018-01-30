// @flow
import * as types from './types';

type Notifiction = {
  type: string,
  message: string
}

export function setCurrentToken(tokenId: string) {
  return {
    type: types.SET_CURRENT_TOKEN,
    payload: tokenId,
  };
}

export function setCurrentPair(tokenId: string) {
  return {
    type: types.SET_CURRENT_PAIR,
    payload: tokenId,
  };
}

export function setSearchQuery(searchQuery: string) {
  return {
    type: types.SET_SEARCH_QUERY,
    payload: searchQuery,
  };
}

export function sendNotification({ type, message }: Notifiction) {
  return {
    type: types.SEND_NOTIFICATION,
    payload: {
      type,
      message,
    },
  };
}
