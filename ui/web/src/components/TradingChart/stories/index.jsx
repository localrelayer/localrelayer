import React from 'react';
import {
  storiesOf,
} from '@storybook/react';
import {
  withKnobs,
  boolean,
} from '@storybook/addon-knobs';

import TradingPageLayout from 'web-components/TradingPageLayout';
import 'web-styles/main.less';
import TradingChart from '..';
import {
  api,
} from 'instex-core';

export const assetPair = {
  id: '0xe41d2489571d322189246dafa5ebde1f4699f498_0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  assetDataA: {
    minAmount: '0',
    maxAmount: '10000000000000000000',
    precision: 5,
    assetData: {
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      name: '0x Protocol Token',
      symbol: 'ZRX',
      decimals: 18,
    },
  },
  assetDataB: {
    minAmount: '0',
    maxAmount: '50000000000000000000',
    precision: 5,
    assetData: {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
  },
};

const onSubscribeBars = (chartBarCallback) => {
  setInterval(() => {
    // 1 min ago
    const time = new Date() - 60000;
    const getRand = () => (Math.random() * 5).toFixed(6);
    const bar = {
      volume: getRand(),
      time: +time,
      open: getRand(),
      close: getRand(),
      low: getRand(),
      high: getRand(),
    };
    chartBarCallback(bar);
  }, 1000);
};

const TradingChartStory = () => (
  <TradingPageLayout.Preview
    hideRest={boolean('Hide preview layout', false)}
    tradingChart={(
      <TradingChart
        assetPair={assetPair}
        networkId={1}
        getBars={api.getBars}
        onSubscribeBars={(onSubscribeBars)}
      />
    )}
  />
);


storiesOf('Components|TradingChart', module)
  .addDecorator(withKnobs)
  .addParameters({
    info: {
      propTables: [TradingChart],
    },
  })
  .add(
    'default',
    TradingChartStory,
    {
      info: {
        text: `
          TradingChart component meant to display current asset pair with last trading info.
        `,
      },
    },
  )
  .add(
    'full screen',
    TradingChartStory,
    {
      options: {
        goFullScreen: true,
      },
    },
  );
