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
  type: typeof actionTypes.CHANGE_PROVIDER,
  payload: {|
    provider: string,
  |}
|} |
{|
  type: typeof actionTypes.SET_ADDRESS,
  payload: {|
    address: string,
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
