// @flow
// import * as R from 'ramda';
// import moment from 'moment';
import type {
  Token,
} from 'instex-core/types';
import {
  socketConnect,
} from 'instex-core/src/sagas/socket';
import config from '../../config';


// const generateMockBars = ({
//   start,
//   end,
//   resolution,
//   symbolInfo,
// }) => {
//   const diff = end.diff(start, 'days');
//   return Array.from(Array(diff).keys()).map((i) => {
//     const time = start.clone().add(i, 'day').startOf('day');
//     const msTime = time.unix() * 1000;
//     return {
//       time: msTime,
//       close: 10 + i,
//       open: 1,
//       high: 10 + i,
//       low: 1 + i,
//     };
//   });
// };

// const resolutionsDiffMap = {
//   1: {
//     moment: 'minutes',
//     divide: 1,
//     multiply: 1,
//   },
//   10: {
//     moment: 'minutes',
//     divide: 10,
//     multiply: 10,
//   },
//   30: {
//     moment: 'minutes',
//     divide: 30,
//     multiply: 30,
//   },
//   60: {
//     moment: 'hours',
//     divide: 1,
//     multiply: 1,
//   },
//   D: {
//     moment: 'days',
//     divide: 1,
//     multiply: 1,
//   },
// };

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

  subscribeBars: async (symbolInfo, resolution, onRealtimeCallback, subscriberUID) => {
    const socket = await socketConnect();
    socket.on('updated_bar', (data) => {
      console.log(data.token, symbolInfo.ticker);
      if (data.token === symbolInfo.ticker) {
        onRealtimeCallback(data.bar);
      }
    });
    console.log('subscribeBars', symbolInfo, resolution, subscriberUID);
  },

  unsubscribeBars: () => {
    console.log('unsubscribeBars');
  },

});

