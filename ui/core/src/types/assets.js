// @flow


export type Asset = {
  id: string,
  address: string,
  name: string,
  symbol: string,
  decimals: number,
  balance?: string,
  isTradable?: boolean,
};

export type AssetPair = {
  id: string,
  assetDataA: {
    minAmount: string,
    maxAmount: string,
    precision: number,
    assetData: Asset,
  },
  assetDataB: {
    minAmount: string,
    maxAmount: string,
    precision: number,
    assetData: Asset,
  },
  tradingInfo: {
    lastPrice: string,
    minPrice: number,
    maxPrice: string,
    assetAVolume: string,
    assetBVolume: string,
    change24: string,
    firstOrderPrice: string,
  },
};
