import {
  BigNumber,
} from '0x.js';


export const calculateTradingInfo = ({
  makerAssetAmount,
  takerAssetAmount,
  currentTradingInfo = {},
}) => {
  const {
    minPrice: prevMinPrice = 0,
    maxPrice: prevMaxPrice = 0,
    assetAVolume: prevAssetAVolume,
    assetBVolume: prevAssetBVolume,
    firstOrderPrice,
  } = currentTradingInfo;

  const lastPrice = new BigNumber(takerAssetAmount).div(new BigNumber(makerAssetAmount));

  const minPrice = BigNumber.min(lastPrice, prevMinPrice).toNumber() || lastPrice;
  const maxPrice = BigNumber.max(lastPrice, prevMaxPrice).toNumber() || lastPrice;

  const assetAVolume = prevAssetAVolume
    ? new BigNumber(makerAssetAmount).plus(prevAssetAVolume)
    : makerAssetAmount;

  const assetBVolume = prevAssetBVolume
    ? new BigNumber(takerAssetAmount).plus(prevAssetBVolume)
    : takerAssetAmount;

  const change24 = firstOrderPrice
    ? new BigNumber(lastPrice)
      .div(firstOrderPrice)
      .minus(1)
      .times(100)
      .toFixed(2)
    : '0.00';

  return {
    lastPrice: new BigNumber(lastPrice).toFixed(8),
    minPrice: new BigNumber(minPrice).toFixed(8),
    maxPrice: new BigNumber(maxPrice).toFixed(8),
    assetAVolume: new BigNumber(assetAVolume).toFixed(8),
    assetBVolume: new BigNumber(assetBVolume).toFixed(8),
    change24,
    firstOrderPrice: new BigNumber(firstOrderPrice || lastPrice).toFixed(8),
  };
};
