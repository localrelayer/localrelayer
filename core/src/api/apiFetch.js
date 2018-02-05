import {
  finance,
  random,
} from 'faker';
import {
  times,
} from 'ramda';

import config from '../config';
import tokensSeeds from './seeds/tokens.json';


export const tokens = tokensSeeds.map(({
  address,
  ...attributes
}) => ({
  id: address,
  ...attributes,
  address,
}));

const fakeTokens = () =>
  Promise.resolve({
    data: tokens.map(({ id, ...attributes }) => ({
      type: 'tokens',
      id,
      links: {
        self: `${config.apiUrl}/tokens/${id}`,
      },
      attributes: { ...attributes },
    })),
  });


const getTestOrder = tokenId =>
  index => ({
    id: random.uuid(),
    price: finance.amount(0, 2, 4),
    amount: finance.amount(0, 1000, 4),
    total: finance.amount(0, 1000, 4),
    token_id: tokenId,
    action: Math.random() > 0.5 ? 'sell' : 'buy',
    completed_at: (index % 2) ? new Date().toString() : null,
  });

export const generateTestOrders = token => times(getTestOrder(token), 100);

const fakeOrders = tokenId =>
  Promise.resolve({
    data: generateTestOrders(tokenId).map(({ id, ...attributes }) => ({
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
  meta,
}) {
  if (config.useMock) {
    switch (url) {
      case `${config.apiUrl}/tokens/filter`:
        return fakeTokens();
      case `${config.apiUrl}/orders/filter`:
        return fakeOrders(meta.requestData.filter['token.id'].eq);
      default:
        return null;
    }
  } else {
    return fetch(
      url,
      {
        ...meta,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    ).then((response) => {
      if (response.headers.get('Content-Type') === 'application/json; charset=utf-8') {
        return response.json();
      }
      return response;
    });
  }
}
