// @flow

import type {
  AssetPair,
} from 'instex-core/types';
import {
  assetDataUtils, BigNumber,
} from '0x.js';
import {
  api,
} from 'instex-core';
import config from 'web-config';
import {
  Web3Wrapper,
} from '@0x/web3-wrapper';

export const getDatafeed = (assetPair: AssetPair) => ({
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
    console.log(assetPair);
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

    const bars = Object.keys(data.bars).map((a) => {
      // Convert volume to normal unit amount
      data.bars[a].volume = +Web3Wrapper.toUnitAmount(
        new BigNumber(data.bars[a].volume),
        assetPair.assetDataB.assetData.decimals,
      ).toFixed(8);
      return data.bars[a];
    }) || [];

    console.log(bars);

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
      pricescale: 1000000,
      has_daily: true,
    }), 0);
  },

  subscribeBars: async (symbolInfo: any, resolution: any, onRealtimeCallback: any) => {
    console.log(symbolInfo);
    const socket = new WebSocket(config.socketUrl);
    socket.onopen = () => {
      console.log('CHART SOCKET connected');
      console.log('_______');
    };

    socket.onmessage = message => console.log('GOT MESSAGE', message);

    // socket.onmessage('updated_bar', (data) => {
    //   console.log('SOCKETDATA', data);
    // });
    // console.log('SOCKET', socket);
    // socket.onmessage('updated_bar', (data) => {
    //   console.log('SOCKETDATA', data);
    //   if (data.token === symbolInfo.ticker) {
    //     onRealtimeCallback(data.bar);
    //   }
    // });
  },

  unsubscribeBars: () => {
    console.log('unsubscribeBars');
  },

});
