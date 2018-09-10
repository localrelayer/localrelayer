import sqlFixtures from 'sql-fixtures';
import moment from 'moment';
import uuid from 'uuid/v4';
import {
  finance,
} from 'faker';

import {
  pgKnex as knex,
} from '../src/db';
import {
  ordersSpec,
} from './orders';
import {
  tokensSpec,
} from './tokens';
import tokens from './tokens.main';


const dbConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        client: 'pg',
        connection: {
          host: 'instex.cslrhqzrkz4f.us-west-1.rds.amazonaws.com',
          user: 'instex',
          password: 'sk21j8oajsjhHA&7231jhakjsda',
          database: 'instex',
          port: 5432
        },
      };
    case 'test':
      return {
        client: 'pg',
        connection: {
          host: 'localhost',
          user: 'instextest',
          password: 'instextest',
          database: 'instextest',
          port: 5432
        },
      };
    case 'development':
    default:
      return {
        client: 'pg',
        connection: {
          host: 'localhost',
          user: 'instex',
          password: 'instex',
          database: 'instex',
          port: 5432
        },
      };
  }
};

const tokensDataSpec =
  process.env.NODE_ENV === 'production' ?
    {
      tokens,
    }
    :
    {
      tokens: tokensSpec,
    };

const ordersDataSpec = {
  orders: ordersSpec
};

const generateOrders = async (start, end, numberPerDay, completed) => {
  const diff = end.diff(start, 'months');
  const [weth, zrx] = process.env.NODE_ENV === 'production' ? tokens : tokensSpec;
  const monthsNumber = Array(diff).keys();
  console.log(diff, monthsNumber);
  await Promise.all(
    Array.from(monthsNumber).map(async (month) => {
      const daysNumber = Array(start.clone().add(month, 'months').daysInMonth() * numberPerDay).keys();
      const orders = Array.from(daysNumber).map((day) => {
        const order = {
          id: uuid(),
          price: finance.amount(0, 0.8, 8),
          amount: finance.amount(0, 10000, 8),
          maker_address: Math.random() > 0.8 ? finance.ethereumAddress() : '0x5409ED021D9299bf6814279A6A1411A7e866A631',
          type: Math.random() > 0.5 ? 'sell' : 'buy',
          zrxOrder: {},
          token_address: zrx.address,
          pair_address: weth.address,
          status: completed ? 'completed' : 'new',
          order_hash: '0x034343',
          is_history: completed ? true : null,
          expires_at: moment().add(7, 'days'),
          created_at: moment().subtract(2, 'years'),
          completed_at: completed ? start
            .clone()
            .add(month, 'months')
            .add(Math.floor(day / 100), 'days')
            .add(Math.floor(Math.random() * 24) + 1, 'hours') : null,
        };

        order.total = (order.price * order.amount).toFixed(8);

        return order;
      });
      await sqlFixtures.create(dbConfig, {
        orders
      });
    })
  );
};

(async () => {
  const rawResp = await knex.raw("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public';");
  const tablesNames = rawResp.rows.map(i => `"${i.tablename}"`).filter(n => n !== '"spatial_ref_sys"');
  if (tablesNames.length) {
    try {
      await knex.raw(`DROP TABLE ${tablesNames.join()} CASCADE`);
    } catch (err) {
      console.log(err);
    }
  }
  try {
    await knex.migrate.latest();
    await sqlFixtures.create(dbConfig(), tokensDataSpec);
    // const start = moment().subtract(2, 'years').startOf('day');
    // const end = moment().startOf('day');
    // await generateOrders(start, end, 100, true);
    // await generateOrders(start, end, 100);
  } catch (e) {
    console.log('Error on creating fixtures', e);
  }
  process.exit();
})();
