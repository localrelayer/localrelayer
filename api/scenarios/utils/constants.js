import {
  BigNumber,
} from '0x.js';

export const DECIMALS = 18;
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO = new BigNumber(0);
export const GANACHE_NETWORK_ID = 50;
export const KOVAN_NETWORK_ID = 42;
export const ROPSTEN_NETWORK_ID = 3;
export const GAS_DEFAULT = 400000;
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);

export const ONE_SECOND_MS = 1000;
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
export const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;

export const FEE_RECIPIENT = '0xc6c3d375b62d66fe0a796ed4ac30bd09ff2d1be5';
