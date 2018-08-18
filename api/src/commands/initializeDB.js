import { pgKnex as knex } from '../db';

(async () => {
  const rawResp = await knex.raw(
    'SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname=\'public\';'
  );
  const tablesNames = rawResp.rows.map(i => `"${i.tablename}"`).filter(n => n !== '"spatial_ref_sys"');
  if (tablesNames.length) {
    try {
      await knex.raw(
        `DROP TABLE ${tablesNames.join()} CASCADE`
      );
    } catch (err) {
      console.log(err);
    }
  }
  await knex.migrate.latest();
  process.exit();
})();
