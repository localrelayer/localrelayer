import {
  BigNumber,
} from '0x.js';

import {
  NULL_ADDRESS,
} from './constants';


export function toBaseUnit(amount, decimals) {
  const unit = new BigNumber(10).pow(decimals);
  return (new BigNumber(amount)).times(unit);
}

export const getOrderConfig = () => ({
  senderAddress: NULL_ADDRESS,
  feeRecipientAddress: '0xc6c3d375b62d66fe0a796ed4ac30bd09ff2d1be5',
  makerFee: '0',
  takerFee: '0',
});
