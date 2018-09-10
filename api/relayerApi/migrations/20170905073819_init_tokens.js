exports.up = knex =>
  knex.schema.createTable('tokens', (table) => {
    table.string('address').primary();
    table.string('symbol').notNullable();
    table.string('name').notNullable();
    table.integer('decimals').notNullable();
    table.boolean('is_listed').nullable();
    table.dateTime('created_at').nullable();
    table.dateTime('deleted_at').nullable();
  });


exports.down = knex =>
  knex.schema.dropTable('tokens');
