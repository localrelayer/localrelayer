import {
  finance,
} from 'faker';
import moment from 'moment';
import uuid from 'uuid/v4';
import tokens from './tokens.json';

const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

const getTestOrder = (token, i) => ({
  id: uuid(),
  price: i + 1,
  amount: finance.amount(0, 1000, 8),
  total: finance.amount(20, 2000, 8),
  type: Math.random() > 0.5 ? 'sell' : 'buy',
  zrxOrder: {},
  maker_address: finance.ethereumAddress(),
  token_address: token.address,
  pair_address: token.address,
  status: 'new',
  expires_at: moment()
    .add(7, 'days'),
  created_at: moment(),
  completed_at:
    i % 2
      ? moment()
        .add(7, 'days')
      : null
});

export const ordersSpec = flatten(tokens.map(t => Array.from(Array(50).keys()).map(index => getTestOrder(t, index))));
