// @flow
import {
  actionTypes,
} from '.';
import type {
  Asset,
} from '../types';

export const fetchAssetPairsRequest = query => ({
  type: actionTypes.FETCH_ASSET_PAIRS_REQUEST,
  query,
});

export const checkPairRequest = query => ({
  type: actionTypes.CHECK_PAIR_REQUEST,
  query,
});

export const setApprovalRequest = (isTradable: boolean, asset: Asset) => ({
  type: actionTypes.SET_APPROVAL_REQUEST,
  isTradable,
  asset,
});

export const depositOrWithdrawRequest = (method: string, amount: string) => ({
  type: actionTypes.DEPOSIT_WITHDRAW_REQUEST,
  method,
  amount,
});

export const withdrawRequest = (amount: string) => ({
  type: actionTypes.WITHDRAW_REQUEST,
  amount,
});
