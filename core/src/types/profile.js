import * as actionTypes from '../actions/types';
import type { Token } from './';

export type ProfileAction =
{|
  type: typeof actionTypes.SET_PROFILE_STATE,
  payload: {|
    key: string,
    value: any,
  |},
|} |
{|
  type: typeof actionTypes.LOAD_USER,
|} |
{|
  type: typeof actionTypes.UPDATE_TOKEN,
  payload: {|
    tokenAddress: string,
    field: string,
    value: any,
  |}
|}

export type ProfileState = {|
  isLoading: boolean,
  address: string,
  balance: string,
  tokens: Array<Token>,
  connectionStatus: string,
  network: string,
|}
