import knex from 'knex';
import bookshelf from 'bookshelf';
import paranoia from 'bookshelf-paranoia';
import uuid from 'bookshelf-uuid';

import jsonApiParams from './utils/bookshelf-jsonapi-params';
import config from './config';


export const pgKnex = knex({
  client: 'pg',
  connection: config.dbUrl,
});

export const pgBookshelf =
  bookshelf(pgKnex)
    .plugin(jsonApiParams)
    .plugin(paranoia)
    .plugin(uuid);
