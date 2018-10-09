import {
  pgBookshelf as pg,
} from '../../db';


export const tokens = pg.Model.extend({
  tableName: 'tokens',
  softDelete: true,
  idAttribute: 'address',
});

export const tokensDefaultFields = {
  fields: [
    'address',
    'symbol',
    'decimals',
    'name',
    'is_listed',
    'created_at',
  ],
};
