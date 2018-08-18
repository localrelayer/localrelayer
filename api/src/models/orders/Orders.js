import {
  pgBookshelf as pg,
} from '../../db';
import { tokens } from '../tokens/Tokens';

export const orders = pg.Model.extend({
  tableName: 'orders',
  softDelete: true,
  uuid: true,
  token() {
    return this.belongsTo(tokens, 'token_address');
  },
  pair() {
    return this.belongsTo(tokens, 'pair_address');
  },
  parent() {
    return this.hasOne(orders, 'child_id');
  },
  child() {
    return this.belongsTo(orders, 'parent_id');
  }
});

export const ordersDefaultFields = {
  fields: [
    'id',
    'order_hash',
    'price',
    'amount',
    'total',
    'type',
    'zrxOrder',
    'tx_hash',
    'maker_address',
    'token_address',
    'pair_address',
    'expires_at',
    'completed_at',
    'parent_id',
    'child_id',
    'created_at',
    'canceled_at',
    'deleted_at',
    'is_history',
    'status',
  ],
  relations: [
    'token',
    'pair',
  ],
  include: [
    'token',
    'pair',
  ]
};
