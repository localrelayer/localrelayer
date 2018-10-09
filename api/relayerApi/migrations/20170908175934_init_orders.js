exports.up = knex =>
  knex.schema.createTable('orders', (table) => {
    table.uuid('id').primary();
    table.string('order_hash').notNullable();
    table.decimal('price', 24, 12).notNullable();
    table.decimal('amount', 24, 12).notNullable();
    table.decimal('total', 24, 12).notNullable();
    table.string('maker_address');
    table.string('type').notNullable();
    table.json('zrxOrder').notNullable();
    table.uuid('parent_id').references('orders.id');
    table.uuid('child_id').references('orders.id');
    table.string('token_address').references('tokens.address').notNullable();
    table.string('pair_address').references('tokens.address').notNullable();
    table.string('tx_hash');
    table.enu(
      'status',
      [
        'new',
        'pending',
        'completed',
        'canceled',
        'failed',
      ]
    ).notNullable();
    table.boolean('is_history').nullable();
    table.dateTime('expires_at').notNullable();
    table.dateTime('created_at').nullable();
    table.dateTime('deleted_at').nullable();
    table.dateTime('completed_at').nullable();
    table.dateTime('canceled_at').nullable();
  });

exports.down = knex =>
  knex.schema.dropTable('orders');
