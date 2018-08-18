// @flow

import type {
  Token,
} from 'instex-core/types';
import {
  socketConnect,
} from 'instex-core/src/sagas/socket';
import config from '../../config';

export const getDatafeed = (token: Token) => ({
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

  getBars: (
    symbolInfo: any,
    resolution: any,
    from: any,
    to: any,
    onHistoryCallBack: any,
  ) => {
    // const res = resolutionsDiffMap[resolution];
    // const start = moment.unix(from).startOf(res.moment).utc();
    // const end = moment.unix(to).startOf(res.moment).utc();
    fetch(
      `${config.apiUrl}/orders/bars`,
      {
        method: 'POST',
        body: JSON.stringify({
          tokenAddress: symbolInfo.ticker,
          from,
          to,
          resolution,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    ).then(r => r.json()).then((data) => {
      // const diff = end.diff(start, res.moment);

      const meta = {
        noData: false,
      };
      const bars = Object.keys(data).map(a => data[a]) || [];

      if (!bars.length) {
        meta.noData = true;
      }

      setTimeout(() => onHistoryCallBack(bars, meta), 0);
    });
  },

  resolveSymbol: async (symbolName: string, onSymbolResolvedCallback: any) => {
    setTimeout(() => onSymbolResolvedCallback({
      name: token.symbol,
      description: token.name,
      session: '24x7',
      type: 'bitcoin',
      ticker: token.id,
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
    const socket = await socketConnect();
    socket.on('updated_bar', (data) => {
      if (data.token === symbolInfo.ticker) {
        onRealtimeCallback(data.bar);
      }
    });
  },

  unsubscribeBars: () => {
    console.log('unsubscribeBars');
  },

});

