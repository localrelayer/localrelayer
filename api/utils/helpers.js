import {
  BigNumber,
} from '0x.js';
import {
  getContractAddressesForNetworkOrThrow,
} from '@0x/contract-addresses';

import {
  NULL_ADDRESS,
  ORDER_FIELDS,
  GANACHE_CONTRACT_ADDRESSES,
} from './constants';

const orderConfig = {
  senderAddress: NULL_ADDRESS,
  feeRecipientAddress: '0xc6c3d375b62d66fe0a796ed4ac30bd09ff2d1be5',
  makerFee: '0',
  takerFee: '0',
};

export const getOrderConfig = () => orderConfig;

export const setMakerFeeForTest = (makerFee) => {
  orderConfig.makerFee = makerFee;
};

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
  clearObjectKeys(order, ORDER_FIELDS)
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
  remainingFillableMakerAssetAmount,
  remainingFillableTakerAssetAmount,
  networkId,
  orderHash,
  ...order
}) => ({
  order,
  metaData: {
    isValid,
    remainingFillableMakerAssetAmount,
    remainingFillableTakerAssetAmount,
    networkId,
    orderHash,
  },
});
