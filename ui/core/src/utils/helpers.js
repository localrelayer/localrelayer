import {
  BigNumber,
} from '0x.js';
import {
  getContractAddressesForNetworkOrThrow,
} from '@0x/contract-addresses';

import {
  ORDER_FIELDS,
  GANACHE_CONTRACT_ADDRESSES,
} from './constants';


export function toUnitAmount(amount, decimals) {
  const aUnit = new BigNumber(10).pow(decimals);
  const unit = new BigNumber(amount).div(aUnit);
  return unit;
}
export function toBaseUnitAmount(amount, decimals) {
  const unit = new BigNumber(10).pow(decimals);
  return (new BigNumber(amount)).times(unit);
}

export const transformBigNumberOrder = order => (
  Object.keys(order).reduce((acc, fieldName) => ({
    ...acc,
    [fieldName]: (
      [
        'salt',
        'makerAssetAmount',
        'takerAssetAmount',
        'makerFee',
        'takerFee',
        'expirationTimeSeconds',
      ].includes(fieldName) ? new BigNumber(order[fieldName]) : order[fieldName]
    ),
  }), {})
);

export const clearObjectKeys = (obj, keys) => (
  Object.keys(obj).reduce((acc, key) => ({
    ...acc,
    ...(keys.includes(key) ? { [key]: obj[key] } : {}),
  }), {})
);

export const clearOrderFields = order => (
  clearObjectKeys(order, ORDER_FIELDS)
);

export function getContractAddressesForNetwork(networkId) {
  if (networkId === 50) {
    return GANACHE_CONTRACT_ADDRESSES;
  }
  const contractAddresses = getContractAddressesForNetworkOrThrow(networkId);
  return contractAddresses;
}

export const getType = (baseAssetData, makerAssetData) => (
  baseAssetData === makerAssetData ? 'ask' : 'bid'
);

export const getPrice = (type, makerAssetAmount, takerAssetAmount) => (
  type === 'bid'
    ? new BigNumber(takerAssetAmount).div(makerAssetAmount)
    : new BigNumber(makerAssetAmount).div(takerAssetAmount));
