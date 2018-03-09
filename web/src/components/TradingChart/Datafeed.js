// @flow
import * as R from 'ramda';
import moment from 'moment';

import store from '../../store';
import config from '../../config';


const generateMockBars = ({
  start,
  end,
  resolution,
  symbolInfo,
}) => {
  const diff = end.diff(start, 'days');
  return Array.from(Array(diff).keys()).map((i) => {
    const time = start.clone().add(i, 'day').startOf('day');
    const msTime = time.unix() * 1000;
    return {
      time: msTime,
      close: 10 + i,
      open: 1,
      high: 10 + i,
      low: 1 + i,
    };
  });
};

const resolutionsDiffMap = {
  '1': {
    moment: 'minutes',
    divide: 1,
    multiply: 1,
  },
  '10': {
    moment: 'minutes',
    divide: 10,
    multiply: 10,
  },
  '30': {
    moment: 'minutes',
    divide: 30,
    multiply: 30,
  },
  '60': {
    moment: 'hours',
    divide: 1,
    multiply: 1,
  },
  'D': {
    moment: 'days',
    divide: 1,
    multiply: 1,
  }
};

const datafeed = {
  onReady: (cb: any) => {
    cb({
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
    });
  },

  getBars: (
    symbolInfo: any,
    resolution: any,
    from: any,
    to: any,
    onHistoryCallBack: any,
  ) => {
    const res = resolutionsDiffMap[resolution];
    const start = moment.unix(from).startOf(res.moment).utc();
    const end = moment.unix(to).startOf(res.moment).utc();
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
      const diff = end.diff(start, res.moment);
      const bars = Array.from(Array(Math.floor(diff / res.divide)).keys()).map((i) => {
        const time = start.clone().utc().startOf('day').add(i * res.multiply, res.moment);
        if (data[time.unix()]) {
          return data[time.unix()];
        }
        const msTime = time.unix() * 1000;
        return {
          time: msTime,
          close: 0,
          open: 0,
          high: 0,
          low: 0,
          volume: 0,
        };
      });
      onHistoryCallBack(bars);
    });
  },

  resolveSymbol: (symbolName: string, onSymbolResolvedCallback: any) => {
    const state = store.getState();
    const tokens = R.pickBy(
      t => (t.attributes.symbol === symbolName),
      state.tokens.resources,
    );
    const token = tokens[Object.keys(tokens)[0]];
    onSymbolResolvedCallback({
      name: token.attributes.symbol,
      description: token.attributes.name,
      session: '24x7',
      type: 'bitcoin',
      ticker: token.id,
      has_intraday: true,
      supported_resolutions: [
        '1',
        '10',
        '30',
        '60',
        'D',
        '7D',
        '30D',
      ],
    });
  },

  subscribeBars: () => {
    console.log('subscribeBars');
  },

};

export default datafeed;
