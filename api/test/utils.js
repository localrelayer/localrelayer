import supertest from 'supertest';
import * as Web3 from 'web3';
import { ZeroEx } from '0x.js';
import moment from 'moment';

import BigNumber from '../src/utils/BigNumber';
import { app } from '../src/server';

/* eslint-disable no-param-reassign */

const request = supertest.agent(app.listen(3001));

export { request };

const provider = new Web3.providers.HttpProvider('http://localhost:8545');
const zeroEx = new ZeroEx(provider, {
  networkId: 50,
});

export const getSellOrder = async (price = 0.05, amount = 5, total = BigNumber(price).times(amount).toFixed(12)) => {
  const addresses = await zeroEx.getAvailableAddressesAsync();
  const { NULL_ADDRESS } = ZeroEx;
  const EXCHANGE_ADDRESS = await zeroEx.exchange.getContractAddress();

  const sellOrder = {
    attributes: {
      price,
      amount,
      total,
      type: 'sell',
      token_address: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
      pair_address: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
      expires_at: '2122-02-20 11:55:34.014+02',
    },
    id: '32894234823'
  };

  const sellZrxOrder = {
    maker: addresses[0],
    taker: '0x5409ed021d9299bf6814279a6a1411a7e866a631',
    feeRecipient: NULL_ADDRESS,
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: BigNumber(0),
    takerFee: BigNumber(0),
    makerTokenAddress: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
    takerTokenAddress: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
    makerTokenAmount: ZeroEx.toBaseUnitAmount(BigNumber(sellOrder.attributes.amount), 18),
    takerTokenAmount: ZeroEx.toBaseUnitAmount(BigNumber(sellOrder.attributes.total), 18),
    expirationUnixTimestampSec: BigNumber(moment(sellOrder.attributes.expires_at).unix()),
  };

  const sellOrderHash = ZeroEx.getOrderHashHex(sellZrxOrder);
  const sellEcSignature = await zeroEx.signOrderHashAsync(sellOrderHash, addresses[0]);
  const sellSignedZRXOrder = {
    ...sellZrxOrder,
    ecSignature: sellEcSignature,
  };
  await zeroEx.exchange.validateOrderFillableOrThrowAsync(sellSignedZRXOrder);
  sellOrder.attributes.zrxOrder = sellSignedZRXOrder;
  return sellOrder;
};

export const getBuyOrder = async (price = 0.05, amount = 5, total = BigNumber(price).times(amount).toFixed(12)) => {
  const addresses = await zeroEx.getAvailableAddressesAsync();
  const { NULL_ADDRESS } = ZeroEx;
  const EXCHANGE_ADDRESS = await zeroEx.exchange.getContractAddress();
  const buyOrder = {
    attributes: {
      price,
      amount,
      total,
      type: 'buy',
      token_address: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
      pair_address: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
      expires_at: '2122-02-20 11:55:34.014+02',
    },
    id: '34897241',
  };

  const buyZrxOrder = {
    maker: addresses[1],
    taker: '0x5409ed021d9299bf6814279a6a1411a7e866a631',
    feeRecipient: NULL_ADDRESS,
    exchangeContractAddress: EXCHANGE_ADDRESS,
    salt: ZeroEx.generatePseudoRandomSalt(),
    makerFee: BigNumber(0),
    takerFee: BigNumber(0),
    makerTokenAddress: '0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c',
    takerTokenAddress: '0x1d7022f5b17d2f8b695918fb48fa1089c9f85401',
    makerTokenAmount: ZeroEx.toBaseUnitAmount(BigNumber(buyOrder.attributes.total), 18),
    takerTokenAmount: ZeroEx.toBaseUnitAmount(BigNumber(buyOrder.attributes.amount), 18),
    expirationUnixTimestampSec: BigNumber(moment(buyOrder.attributes.expires_at).unix()),
  };
  const buyOrderHash = ZeroEx.getOrderHashHex(buyZrxOrder);
  const buyEcSignature = await zeroEx.signOrderHashAsync(buyOrderHash, addresses[1]);
  const buySignedZRXOrder = {
    ...buyZrxOrder,
    ecSignature: buyEcSignature,
  };
  await zeroEx.exchange.validateOrderFillableOrThrowAsync(buySignedZRXOrder);
  buyOrder.attributes.zrxOrder = buySignedZRXOrder;
  return buyOrder;
};
