import BigNumber from 'bignumber.js';


export const calculateTradingInfo = ({
  makerAssetAmount,
  takerAssetAmount,
  currentTradingInfo = {},
}) => {
  const {
    minPrice: prevMinPrice,
    maxPrice: prevMaxPrice,
    assetAVolume: prevAssetAVolume,
    assetBVolume: prevAssetBVolume,
    firstOrderPrice,
  } = currentTradingInfo;

  const lastPrice = BigNumber(takerAssetAmount).div(BigNumber(makerAssetAmount));

  const minPrice = BigNumber.min(lastPrice, prevMinPrice).toNumber() || lastPrice;
  const maxPrice = BigNumber.max(lastPrice, prevMaxPrice).toNumber() || lastPrice;

  const assetAVolume = prevAssetAVolume
    ? BigNumber(makerAssetAmount).plus(prevAssetAVolume)
    : makerAssetAmount;

  const assetBVolume = prevAssetBVolume
    ? BigNumber(takerAssetAmount).plus(prevAssetBVolume)
    : takerAssetAmount;

  const change24 = firstOrderPrice
    ? BigNumber(lastPrice)
      .div(firstOrderPrice)
      .minus(1)
      .times(100)
      .toFixed(2)
    : '0.00';

  return {
    lastPrice: BigNumber(lastPrice).toFixed(8),
    minPrice: BigNumber(minPrice).toFixed(8),
    maxPrice: BigNumber(maxPrice).toFixed(8),
    assetAVolume: BigNumber(assetAVolume).toFixed(8),
    assetBVolume: BigNumber(assetBVolume).toFixed(8),
    change24,
    firstOrderPrice: BigNumber(firstOrderPrice || lastPrice).toFixed(8),
  };
};
