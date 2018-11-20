// @flow

import type {
  AssetPair,
} from 'instex-core/types';
import type {
  Dispatch,
} from 'redux';
import {
  assetDataUtils, BigNumber,
} from '0x.js';
import {
  api,
  coreActions,
} from 'instex-core';

import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

export const getDatafeed = (assetPair: AssetPair, dispatch: Dispatch) => ({
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
    // TODO: DELETE
    await api.clearMockMethods();
    const data = await api.getBars({
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

    const barsData = data.items || data;
    const bars = Object.keys(barsData).map((a) => {
      // Convert volume to normal unit amount
      const volume = +Web3Wrapper.toUnitAmount(
        new BigNumber(barsData[a].volume),
        assetPair.assetDataB.assetData.decimals,
      );

      return {
        ...barsData[a],
        volume,
      };
    }) || [];

    if (!bars.length) {
      meta.noData = true;
    }

    setTimeout(() => onHistoryCallBack(bars, meta), 0);
  },

  resolveSymbol: async (symbolName: string, onSymbolResolvedCallback: any) => {
    setTimeout(() => onSymbolResolvedCallback({
      name: `${assetPair.assetDataA.assetData.symbol}/${assetPair.assetDataB.assetData.symbol}`,
      description: `${assetPair.assetDataA.assetData.symbol}/${assetPair.assetDataB.assetData.symbol}`,
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

  subscribeBars: async (symbolInfo: any, resolution: any, onRealtimeCallback: any) => {
    dispatch(
      coreActions.tradingChartSubscribeSocket(onRealtimeCallback, assetPair),
    );
  },

  unsubscribeBars: () => {
    console.log('unsubscribeBars');
  },

});
