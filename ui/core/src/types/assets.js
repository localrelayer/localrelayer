// @flow


export type Asset = {
  id: string,
  address: string,
  name: string,
  symbol: string,
  decimals: number,
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
    volume: string,
    change24Hour: number,
    lastPrice: string,
    highPrice: string,
    lowPrice: string,
  },
};
