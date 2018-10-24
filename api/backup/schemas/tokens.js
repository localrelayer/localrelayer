import {
  filterSchema,
} from './common';
import {
  tokens,
  tokensDefaultFields,
} from '../models';


export const filterTokenSchemas = [
  { ...filterSchema },
  {
    fields: {
      presence: false,
      checkFields: {
        fieldTypes: {
          tokens: {
            allowed: tokensDefaultFields.fields,
            message: `Allowed token fields: ${tokensDefaultFields.fields.join()}`,
          }
        }
      },
    },
  }
];

export const createTokenSchemas = () =>
  [
    {
      async: true,
      symbol: {
        presence: {
          message: 'Enter symbol please',
        },
        // checkDbRecordExists: {
        //   reverse: true,
        //   model: tokens,
        //   fieldName: 'symbol',
        //   message: "Token symbol isn't unique",
        // }
      },
      name: {
        presence: {
          message: 'Enter name please',
        },
      },
      decimals: {
        presence: {
          message: 'Enter decimals please',
        },
      },
      address: {
        presence: {
          message: 'Enter address please',
        },
        checkDbRecordExists: {
          reverse: true,
          model: tokens,
          fieldName: 'address',
          message: "Token address isn't unique",
        }
      },
    },
  ];
