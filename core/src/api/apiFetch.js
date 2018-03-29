// @flow
import * as R from 'ramda';

import type {
  ID,
  TokenAttributes,
} from '../types';

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

const fakeTokens = (): Promise<{
  data: Array<{
    type: string,
    id: ID,
    links: {|
      self: string,
    |},
  } & TokenAttributes>,
}> =>
  Promise.resolve({
    data: tokens.map(({
      id,
      ...attributes
    }) => ({
      type: 'tokens',
      id,
      links: {
        self: `${config.apiUrl}/tokens/${id}`,
      },
      attributes,
    })),
  });

/* eslint-disable */
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
/* eslint-enable */

const randomDecimal = (
  min,
  max,
) =>
  (Math.random() * ((min - max) + max)).toFixed(4);

const getTestOrder = tokenId =>
  index => ({
    id: uuidv4(),
    price: randomDecimal(0, 2),
    amount: randomDecimal(0, 1000),
    total: randomDecimal(0, 1000),
    token_id: tokenId,
    action: Math.random() > 0.5 ? 'sell' : 'buy',
    completed_at: (index % 2) ? new Date().toString() : null,
  });

export const generateTestOrders = token => R.times(getTestOrder(token), 100);

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
}: {
  url: string,
  meta: any,
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
