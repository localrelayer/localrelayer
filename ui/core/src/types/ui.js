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
|} |
{|
  type: typeof actionTypes.SEND_MESSAGE,
  payload: any,
|} |
{|
  type: typeof actionTypes.SHOW_MODAL,
  payload: {
    title: string,
    type: string,
    name?: string,
    text?: *,
  },
|}

export type UiState = {|
  currentPairId: null | ID,
  currentTokenId: null | ID,
  searchQuery: string,
  isBalanceLoading: boolean,
|}
