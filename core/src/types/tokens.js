//@flow

export type Token = {
  id: number,
  symbol: string,
  tradingPair: string,
  highPrice: string,
  lowPrice: string,
  tradingVolume: number,
  change24Hour: number,
  lastPrice: string
};
