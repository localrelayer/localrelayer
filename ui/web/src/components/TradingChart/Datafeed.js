// @flow
import type {
  AssetPair,
} from 'instex-core/types';

import {
  assetDataUtils,
} from '0x.js';
import {
  utils,
} from 'instex-core';


export const getDatafeed = (
  assetPair: AssetPair,
  networkId: any,
  apiGetBars: Function,
  onSubscribeBars: Function,
) => ({
  onReady: (cb: any) => {
    setTimeout(() => cb({
      supports_search: false,
      supports_group_request: false,
      supports_marks: false,
      supported_resolutions: [
        '1',
        '10',
        '30',
        '60',
        'D',
        '7D',
        '30D',
      ],
    }), 0);
  },

  getBars: async (
    symbolInfo: any,
    resolution: any,
    from: any,
    to: any,
    onHistoryCallBack: any,
    onErrorCallback: any,
    firstDataRequest: boolean,
  ) => {
    const baseAssetData = assetDataUtils
      .encodeERC20AssetData(assetPair.assetDataA.assetData.address);
    const quoteAssetData = assetDataUtils
      .encodeERC20AssetData(assetPair.assetDataB.assetData.address);
    const data = await apiGetBars({
      networkId,
      baseAssetData,
      quoteAssetData,
      from,
      to,
      resolution,
      firstDataRequest,
    });

    const meta = {
      noData: false,
    };

    const decimalsGap = Math.abs(assetPair.assetDataA.assetData.decimals
      - assetPair.assetDataB.assetData.decimals);
    const barsData = Object.values(Object.values(data)[0]).map(bar => ({
      time: bar.time,
      close: +utils.toUnitAmount(bar.close.toString(), decimalsGap),
      low: +utils.toUnitAmount(bar.low.toString(), decimalsGap),
      volume: +utils.toUnitAmount(bar.volume.toString(), assetPair.assetDataB.assetData.decimals),
      open: +utils.toUnitAmount(bar.open.toString(), decimalsGap),
      high: +utils.toUnitAmount(bar.high.toString(), decimalsGap),
    }));
    const bars = Object.keys(barsData).map(a => ({
      ...barsData[a],
    })) || [];

    if (!bars.length) {
      meta.noData = true;
    }
    setTimeout(() => onHistoryCallBack(bars, meta), 0);
  },

  resolveSymbol: async (
    symbolName: string,
    onSymbolResolvedCallback: any,
  ) => {
    /* Why setTimeout? */
    setTimeout(() => onSymbolResolvedCallback({
      name: [
        `${assetPair.assetDataA.assetData.symbol}`,
        `${assetPair.assetDataB.assetData.symbol}`,
      ].join('/'),
      description: [
        `${assetPair.assetDataA.assetData.symbol}`,
        `${assetPair.assetDataB.assetData.symbol}`,
      ].join('/'),
      session: '24x7',
      type: 'bitcoin',
      ticker: assetPair.id,
      has_intraday: true,
      exchange: 'Instex',
      has_no_volume: false,
      has_empty_bars: true,
      minmov: 1,
      has_daily: true,
      pricescale: 10 ** 7,
    }), 0);
  },

  subscribeBars: async (
    symbolInfo: any,
    resolution: any,
    chartBarCallback: any,
  ) => {
    onSubscribeBars(
      chartBarCallback,
      assetPair,
    );
  },

  unsubscribeBars: () => {
    console.log('unsubscribeBars');
  },
});
