import {
  finance,
  random,
  hacker,
} from 'faker';
import {
  times,
} from 'ramda';

import config from '../config';
import tokensSeeds from './seeds/tokens.json';


const getTestOrder = () => ({
  id: random.uuid(),
  price: finance.amount(0, 2, 4),
  amount: finance.amount(0, 1000, 4),
  total: finance.amount(0, 1000, 4),
  token: hacker.abbreviation(),
  action: Math.random() > 0.5 ? 'sell' : 'buy',
});

const generateTestOrders = num => times(getTestOrder, num || 100);


const fakeTokens = () =>
  Promise.resolve({
    data: tokensSeeds.map(({ address, ...attributes }) => ({
      type: 'tokens',
      id: address,
      links: {
        self: `${config.apiUrl}/tokens/${address}`,
      },
      attributes,
    })),
  });

const fakeOrders = () =>
  Promise.resolve({
    data: generateTestOrders().map(({ id, ...attributes }) => ({
      type: 'orders',
      id,
      links: {
        self: `${config.apiUrl}/orders/${id}`,
      },
      attributes,
    })),
  });

export function apiFetch({
  url,
}) {
  switch (url) {
    case `${config.apiUrl}/tokens/filter`:
      return fakeTokens();
    case `${config.apiUrl}/orders/filter`:
      return fakeOrders();
    default:
      return null;
  }
}
