module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://instex:instex@localhost:5432/instex',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
  },
  production: {
    client: 'pg',
    connection: 'postgres://instex:sk21j8oajsjhHA&7231jhakjsda@instex.cslrhqzrkz4f.us-west-1.rds.amazonaws.com:5432/instex',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
  },
  test: {
    client: 'pg',
    connection: 'postgres://instextest:instextest@localhost:5432/instextest',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
  },
};
