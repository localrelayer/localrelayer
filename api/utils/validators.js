import {
  SchemaValidator,
} from '@0x/json-schemas';
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
