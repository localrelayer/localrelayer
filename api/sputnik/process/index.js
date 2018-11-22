import {
  BigNumber,
} from '0x.js';


export const calculateTradingInfo = ({
  assetAAmount,
  assetBAmount,
  currentTradingInfo = {},
}) => {
  const {
    minPrice: prevMinPrice = 0,
    maxPrice: prevMaxPrice = 0,
    assetAVolume: prevAssetAVolume,
    assetBVolume: prevAssetBVolume,
    firstOrderPrice,
  } = currentTradingInfo;

  const lastPrice = new BigNumber(assetBAmount).div(assetAAmount).toFixed(8);

  const minPrice = BigNumber.min(lastPrice, prevMinPrice).toNumber() || lastPrice;
  const maxPrice = BigNumber.max(lastPrice, prevMaxPrice).toNumber() || lastPrice;

  const assetAVolume = prevAssetAVolume
    ? new BigNumber(assetAAmount).plus(prevAssetAVolume)
    : assetAAmount;

  const assetBVolume = prevAssetBVolume
    ? new BigNumber(assetBAmount).plus(prevAssetBVolume)
    : assetBAmount;

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
