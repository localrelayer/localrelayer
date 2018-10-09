import { filterSchema } from './common';
import { ordersDefaultFields, orders } from '../models';

export const filterOrderSchemas = [
  { ...filterSchema },
  {
    fields: {
      presence: false,
      checkFields: {
        fieldTypes: {
          orders: {
            allowed: ordersDefaultFields.fields,
            message: `Allowed order fields: ${ordersDefaultFields.fields.join()}`,
          }
        }
      },
    },
    /*
    include: {
      checkArray: {
        allowed: ordersDefaultFields.include,
        message: `Allowed include: ${ordersDefaultFields.include}`,
      }
    }
    */
  }
];

export const createOrderSchemas = () =>
  [
    {
      async: true,
      price: {
        presence: {
          message: 'Enter price please',
        },
      },
      amount: {
        presence: {
          message: 'Enter amount please',
        },
      },
      type: {
        presence: {
          message: 'Add type please',
        },
      },
      zrxOrder: {
        presence: {
          message: 'Add zrx order object please',
        },
      },
      token_address: {
        presence: {
          message: 'Add token address please',
        },
      },
      expires_at: {
        presence: {
          message: 'Add order expire date please',
        },
      },
    },
  ];

export const updateOrderSchemas = () => [
  {
    async: true,
    id: {
      checkDbRecordExists: {
        reverse: false,
        model: orders,
        fieldName: 'id',
        message: 'Order does not exist',
      }
    },
  }
];

