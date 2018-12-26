import {
  SchemaValidator,
} from '@0x/json-schemas';
import {
  BigNumber,
} from '0x.js';
import {
  AssetPair,
} from 'db';
import {
  getOrderConfig,
} from './helpers';

export const validator = new SchemaValidator();

export const validateOrderConfig = (order) => {
  const config = getOrderConfig();
  return Object.keys(config).reduce(
    (acc, fieldName) => ([
      ...acc,
      ...(
        order[fieldName] !== config[fieldName]
          ? [{
            field: fieldName,
            code: fieldName.includes('Address') ? 1003 : 1004,
            reason: 'Wrong order config field',
          }]
          : []
      ),
    ]), [],
  );
};

export const validateExpirationTimeSeconds = expirationTimeSeconds => (
  (+new Date() - Number(expirationTimeSeconds)) > 60
);

export const validateNetworkId = networkId => ([
  1,
  42,
  ...(
    ['development', 'test'].includes(process.env.NODE_ENV)
      ? [50]
      : []
  ),
].includes(networkId));

export const getValidationErrors = (instance, schema) => {
  const validationInfo = validator.validate(
    instance,
    schema,
  );
  const errors = validationInfo.errors.filter(e => e.name !== 'allOf').map(
    error => (
      {
        field: error.name === 'required' ? error.argument : error.property.split('.')[1],
        code: error.name === 'required' ? 1000 : 1001,
        reason: error.message,
      }
    ),
  );
  return {
    code: 100,
    reason: 'Validation failed',
    validationErrors: errors,
  };
};

export const validateMinOrderAmount = async (order) => {
  const askAssetPair = await AssetPair.findOne({
    'assetDataA.assetData': order.makerAssetData,
    'assetDataB.assetData': order.takerAssetData,
  });

  const bidAssetPair = await AssetPair.findOne({
    'assetDataA.assetData': order.takerAssetData,
    'assetDataB.assetData': order.makerAssetData,
  });

  if (
    (askAssetPair
    && (
      new BigNumber(order.makerAssetAmount).lt(askAssetPair.assetDataA.minAmount)
      || new BigNumber(order.takerAssetAmount).lt(askAssetPair.assetDataB.minAmount)
    ))
    || (bidAssetPair
    && (
      new BigNumber(order.makerAssetAmount).lt(bidAssetPair.assetDataB.minAmount)
      || new BigNumber(order.takerAssetAmount).lt(bidAssetPair.assetDataA.minAmount)
    ))) {
    return false;
  }
  return true;
};

export const validateMaxOrderAmount = async (order) => {
  const askAssetPair = await AssetPair.findOne({
    'assetDataA.assetData': order.makerAssetData,
    'assetDataB.assetData': order.takerAssetData,
  });

  const bidAssetPair = await AssetPair.findOne({
    'assetDataA.assetData': order.takerAssetData,
    'assetDataB.assetData': order.makerAssetData,
  });

  if (
    (askAssetPair
    && (
      new BigNumber(order.makerAssetAmount).gt(askAssetPair.assetDataA.maxAmount)
      || new BigNumber(order.takerAssetAmount).gt(askAssetPair.assetDataB.maxAmount)
    ))
    || (bidAssetPair
    && (
      new BigNumber(order.makerAssetAmount).gt(bidAssetPair.assetDataB.maxAmount)
      || new BigNumber(order.takerAssetAmount).gt(bidAssetPair.assetDataA.maxAmount)
    ))) {
    return false;
  }
  return true;
};

export const validateOrderAmount = async (order) => {
  const isMinAmountValid = await validateMinOrderAmount(order);
  const isMaxAmountValid = await validateMaxOrderAmount(order);
  return {
    isMinAmountValid,
    isMaxAmountValid,
  };
};
