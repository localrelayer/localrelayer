// @flow

import * as actionTypes from '../actions/types';
import type { ID } from './';

export type UiAction =
{|
  type: typeof actionTypes.SET_UI_STATE,
  payload: {|
    key: string,
    value: any,
  |},
|} |
{|
  type: typeof actionTypes.FILL_FIELD,
  payload: any,
  meta: {|
    field: string
  |}
|} |
{|
  type: typeof actionTypes.SEND_NOTIFICATION,
  payload: any,
|}

export type UiState = {|
  currentPairId: null | ID,
  currentTokenId: null | ID,
  searchQuery: string,
  isBalanceLoading: boolean,
|}
