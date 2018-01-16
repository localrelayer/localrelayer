import { finance, random, hacker } from 'faker';
import { times, repeat } from 'ramda';

export const getTestOrder = () => ({
  key: random.uuid(),
  price: finance.amount(0, 2, 4),
  amount: finance.amount(0, 1000, 4),
  total: finance.amount(0, 1000, 4),
  token: hacker.abbreviation(),
  action: Math.random() > 0.5 ? 'sell' : 'buy',
});

export const generateTestOrders = num => times(getTestOrder, num || random.number(100));

export const getTestToken = () => ({
  key: random.uuid(),
  symbol: hacker.abbreviation(),
  tradingPair: 'WETH',
  highPrice: finance.amount(0, 2, 4),
  lowPrice: finance.amount(0, 2, 4),
  tradingVolume: finance.amount(0, 500, 4),
  change24Hour: finance.amount(-100, 100),
  lastPrice: finance.amount(0, 2, 4),
});

export const generateTestTokens = num => times(getTestToken, num || random.number(100));

export const testNotification = {};

export const testUser = {
  address: finance.ethereumAddress(),
  notifications: repeat(testNotification, random.number(100)),
};

export const randomDate = (start, end) =>
  new Date((start.getTime() + Math.random()) * (end.getTime() - start.getTime()));

export const testTokens = [
  {
    balance: '120.5422',
    symbol: 'EQC',
    name: 'Ethereum Qchain',
    key: 1,
    tradable: false,
  },
  {
    balance: '50.00',
    symbol: 'CMS',
    name: 'Comsa',
    key: 2,
    tradable: true,
  },
  {
    balance: '1.25',
    symbol: 'TEST',
    name: 'Test Wrapper',
    key: 3,
    tradable: false,
  },
];
