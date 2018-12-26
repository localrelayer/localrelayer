import {
  BigNumber,
} from '0x.js';
import {
  getContractAddressesForNetworkOrThrow,
} from '@0x/contract-addresses';
import {
  ExchangeContractErrs,
} from '@0x/types';
import {
  ContractWrappersError,
} from '@0x/contract-wrappers';
import {
  OrderError,
} from '@0x/order-utils';
import {
  ORDER_FIELDS,
  GANACHE_CONTRACT_ADDRESSES,
} from './constants';


export function toUnitAmount(amount = 0, decimals = 18) {
  const aUnit = new BigNumber(10).pow(decimals);
  const unit = new BigNumber(amount).div(aUnit);
  return unit;
}
export function toBaseUnitAmount(amount = 0, decimals = 18) {
  const unit = new BigNumber(10).pow(decimals);
  return (new BigNumber(amount)).times(unit);
}

export const unitTimeToUnix = (quantity, unit) => {
  switch (unit) {
    case 'minutes':
      return quantity * 60 * 1000;
    case 'hours':
      return quantity * 3600 * 1000;
    case 'days':
      return quantity * 24 * 3600 * 1000;
    case 'months':
      return quantity * 30 * 24 * 3600 * 1000;
    default:
      return 3 * 60 * 1000;
  }
};

export const validateExpiration = (quantity, unit) => {
  const isValidQuantity = n => Number.isInteger(+n)
    && n > 0;
  switch (unit) {
    case 'minutes':
      return {
        status: isValidQuantity(quantity) && quantity.toString().length <= 3,
        error: 'Expiration in minutes must be positive Integer less than 1000',
      };
    case 'hours':
      return {
        status: isValidQuantity(quantity) && quantity.toString().length <= 2,
        error: 'Expiration in hours must be positive Integer less than 100',
      };
    case 'days':
      return {
        status: isValidQuantity(quantity) && quantity.toString().length <= 2,
        error: 'Expiration in days must be positive Integer less than 100',
      };
    case 'months':
      return {
        status: isValidQuantity(quantity) && quantity.toString().length === 1,
        error: 'Expiration in months must be positive Integer less than 10',
      };
    default:
      return false;
  }
};

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

export const getOrderType = (baseAssetData, makerAssetData) => (
  baseAssetData === makerAssetData ? 'ask' : 'bid'
);

export const getOrderPrice = (type, makerAssetAmount, takerAssetAmount) => (
  type === 'bid'
    ? new BigNumber(makerAssetAmount).div(takerAssetAmount)
    : new BigNumber(takerAssetAmount).div(makerAssetAmount));

export const zeroExErrToHumanReadableErrMsg = (error, takerAddress) => {
  const ContractWrappersErrorToHumanReadableError = {
    [OrderError.InvalidSignature]: 'Order signature is not valid',
    [ContractWrappersError.ContractNotDeployedOnNetwork]: 'Contract is not deployed on the detected network',
    [ContractWrappersError.InvalidJump]: 'Invalid jump occured while executing the transaction',
    [ContractWrappersError.OutOfGas]: 'Transaction ran out of gas',
  };
  const exchangeContractErrorToHumanReadableError = {
    [ExchangeContractErrs.OrderFillExpired]: 'This order has expired',
    [ExchangeContractErrs.OrderCancelExpired]: 'This order has expired',
    [ExchangeContractErrs.OrderCancelled]: 'This order has been cancelled',
    [ExchangeContractErrs.OrderFillAmountZero]: "Order fill amount can't be 0",
    [ExchangeContractErrs.OrderRemainingFillAmountZero]: 'This order has already been completely filled',
    [ExchangeContractErrs.OrderFillRoundingError]:
              'Rounding error will occur when filling this order. Please try filling a different amount.',
    [ExchangeContractErrs.InsufficientTakerBalance]:
              'Taker no longer has a sufficient balance to complete this order',
    [ExchangeContractErrs.InsufficientTakerAllowance]:
              'Taker no longer has a sufficient allowance to complete this order',
    [ExchangeContractErrs.InsufficientMakerBalance]:
              'Maker no longer has a sufficient balance to complete this order',
    [ExchangeContractErrs.InsufficientMakerAllowance]:
              'Maker no longer has a sufficient allowance to complete this order',
    [ExchangeContractErrs.InsufficientTakerFeeBalance]: 'Taker no longer has a sufficient balance to pay fees',
    [ExchangeContractErrs.InsufficientTakerFeeAllowance]:
              'Taker no longer has a sufficient allowance to pay fees',
    [ExchangeContractErrs.InsufficientMakerFeeBalance]: 'Maker no longer has a sufficient balance to pay fees',
    [ExchangeContractErrs.InsufficientMakerFeeAllowance]:
              'Maker no longer has a sufficient allowance to pay fees',
    [ExchangeContractErrs.TransactionSenderIsNotFillOrderTaker]: `This order can only be filled by ${takerAddress}`,
    [ExchangeContractErrs.InsufficientRemainingFillAmount]: 'Insufficient remaining fill amount',
  };
  const humanReadableErrorMsg = exchangeContractErrorToHumanReadableError[error]
    || ContractWrappersErrorToHumanReadableError[error];
  return humanReadableErrorMsg;
};

export const formatDate = (template, date) => {
  try {
    const specs = 'YYYY:MM:DD:HH:mm:ss'.split(':');
    const timezonedDate = new Date(date) - new Date().getTimezoneOffset() * 6e4;
    return new Date(timezonedDate)
      .toISOString()
      .split(/[-:.TZ]/)
      .reduce((acc, item, i) => acc.split(specs[i]).join(item), template);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const sortOrderbook = (a, b) => {
  const aPrice = new BigNumber(a.takerAssetAmount).div(a.makerAssetAmount);
  const aTakerFeePrice = new BigNumber(a.takerFee).div(a.takerAssetAmount);
  const bPrice = new BigNumber(b.takerAssetAmount).div(b.makerAssetAmount);
  const bTakerFeePrice = new BigNumber(b.takerFee).div(b.takerAssetAmount);
  const aExpirationTimeSeconds = parseInt(a.expirationTimeSeconds, 10);
  const bExpirationTimeSeconds = parseInt(b.expirationTimeSeconds, 10);
  return aPrice - bPrice
    || aTakerFeePrice - bTakerFeePrice
    || aExpirationTimeSeconds - bExpirationTimeSeconds;
};

export function cfl(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const networks = {
  1: {
    name: 'Mainnet',
    isSupported: true,
  },
  3: {
    name: 'Ropsten',
    isSupported: false,
  },
  4: {
    name: 'Rinkeby',
    isSupported: false,
  },
  42: {
    name: 'Kovan',
    isSupported: true,
  },
  50: {
    name: 'Ganache',
    isSupported: true,
  },
  77: {
    name: 'sokol (POA Network)',
    isSupported: false,
  },
  99: {
    name: 'core (POA Network)',
    isSupported: false,
  },
};

export const getNetwork = id => networks[id] || {
  name: 'Unknown',
  isSupported: false,
};

export const calculateBar = (order, orders) => {
  const index = orders.findIndex(o => o.id === order.id);
  const previousOrders = orders.slice(0, index);
  const accumulator = previousOrders.reduce((acc, cur) => acc + +cur.amount, +order.amount);
  const totalAmount = orders.reduce((acc, cur) => acc + +cur.amount, 0);
  return `${accumulator / totalAmount * 100 / 12 * 8}%`;
};
