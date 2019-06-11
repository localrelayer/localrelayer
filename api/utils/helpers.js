import {
  BigNumber,
} from '0x.js';
import {
  getContractAddressesForNetworkOrThrow,
} from '@0x/contract-addresses';

import {
  NULL_ADDRESS,
  ORDER_FIELDS,
  ORDER_META_FIELDS,
  GANACHE_CONTRACT_ADDRESSES,
} from './constants';

export const getOrderConfig = () => ({
  senderAddress: NULL_ADDRESS,
  feeRecipientAddress: '0x98dA50C21AF5c48c2b524c89f71588adBd985790',
  makerFee: '0',
  takerFee: '0',
});

export function toBaseUnit(amount, decimals) {
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
  clearObjectKeys(
    order,
    ORDER_FIELDS,
  )
);

export const clearOrderWithMetaFields = order => (
  clearObjectKeys(
    order,
    [
      ...ORDER_FIELDS,
      ...ORDER_META_FIELDS,
    ],
  )
);

export function getContractAddressesForNetwork(networkId) {
  if (networkId === 50) {
    return GANACHE_CONTRACT_ADDRESSES;
  }
  const contractAddresses = getContractAddressesForNetworkOrThrow(networkId);
  return contractAddresses;
}

export const constructOrderRecord = ({
  _id,
  makerAssetProxyId,
  takerAssetProxyId,
  isValid,
  isShadowed,
  remainingFillableMakerAssetAmount,
  remainingFillableTakerAssetAmount,
  filledTakerAssetAmount,
  lastFilledAt,
  networkId,
  orderHash,
  createdAt,
  completedAt,
  error,
  sourceRelayer,
  ...order
}) => ({
  order,
  metaData: {
    isValid,
    isShadowed,
    remainingFillableMakerAssetAmount,
    remainingFillableTakerAssetAmount,
    filledTakerAssetAmount,
    networkId,
    orderHash,
    createdAt,
    completedAt,
    lastFilledAt,
    error,
    sourceRelayer,
  },
});
