// @flow
import * as types from './types';


export function setCurrentToken(tokenId: string) {
  return {
    type: types.SET_CURRENT_TOKEN,
    payload: tokenId,
  };
}
