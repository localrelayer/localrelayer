import BigNumber from '../../BigNumber';

export const DECIMALS = 18;
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO = BigNumber(0);
export const GANACHE_NETWORK_ID = 50;
export const KOVAN_NETWORK_ID = 42;
export const ROPSTEN_NETWORK_ID = 3;
export const GAS_DEFAULT = 400000;
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = BigNumber(2).pow(256).minus(1);
