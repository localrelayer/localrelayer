import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import BuySell from './BuySellContainer';
import OrderBook from './OrderBookContainer';
import TradingHistory from './TradingHistoryContainer';
import UserBalance from './UserBalanceContainer';
import UserOrders from './UserOrdersContainer';
import TradingChart from './TradingChartContainer';
import TokenCard from './TokenCardContainer';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const layoutSm = [
  {
    i: 'orderBook', x: 0, y: 0, w: 1, h: 18, static: true,
  },
  {
    i: 'balance', x: 1, y: 3, w: 1, h: 6, static: true,
  },

  {
    i: 'chart', x: 0, y: 18, w: 2, h: 12, static: true,
  },
  {
    i: 'userOrders', x: 0, y: 30, w: 2, h: 12, static: true,
  },
  {
    i: 'tokenCard', x: 6.5, y: 0, w: 1, h: 3, static: true,
  },
  {
    i: 'buySell', x: 1, y: 3, w: 1, h: 9, static: true,
  },
  {
    i: 'history', x: 0, y: 42, w: 2, h: 12, static: true,
  },

];

const layoutMd = [
  {
    i: 'orderBook', x: 0, y: 0, w: 3, h: 18, static: true,
  },
  {
    i: 'balance', x: 6.5, y: 13, w: 3.5, h: 6, static: true,
  },

  {
    i: 'chart', x: 3, y: 0, w: 7, h: 10, static: true,
  },
  {
    i: 'userOrders', x: 3, y: 19, w: 7, h: 12, static: true,
  },
  {
    i: 'tokenCard', x: 6.5, y: 10, w: 3.5, h: 3, static: true,
  },
  {
    i: 'buySell', x: 3, y: 10, w: 3.5, h: 9, static: true,
  },
  {
    i: 'history', x: 0, y: 19, w: 3, h: 12, static: true,
  },

];

const layoutLg = [
  {
    i: 'orderBook', x: 0, y: 0, w: 3, h: 16, static: true,
  },
  {
    i: 'balance', x: 0, y: 16.35, w: 3, h: 6, static: true,
  },

  {
    i: 'chart', x: 3, y: 0, w: 6, h: 12, static: true,
  },
  {
    i: 'userOrders', x: 3, y: 12, w: 6, h: 9, static: true,
  },

  {
    i: 'tokenCard', x: 9, y: 0, w: 3, h: 3, static: true,
  },
  {
    i: 'buySell', x: 9, y: 3, w: 3, h: 9, static: true,
  },
  {
    i: 'history', x: 9, y: 12, w: 3, h: 9, static: true,
  },
];

const layoutLg2 = [
  {
    i: 'orderBook', x: 0, y: 0, w: 5, h: 18, static: true,
  },
  {
    i: 'balance', x: 0, y: 18, w: 5, h: 7, static: true,
  },

  {
    i: 'chart', x: 5, y: 0, w: 14, h: 16, static: true,
  },
  {
    i: 'userOrders', x: 5, y: 12, w: 14, h: 12, static: true,
  },

  {
    i: 'tokenCard', x: 19, y: 0, w: 5, h: 3, static: true,
  },
  {
    i: 'buySell', x: 19, y: 3, w: 5, h: 9, static: true,
  },
  {
    i: 'history', x: 19, y: 15, w: 5, h: 12, static: true,
  },
];

const layoutLg3 = [
  {
    i: 'orderBook', x: 0, y: 0, w: 2, h: 18, static: true,
  },
  {
    i: 'balance', x: 0, y: 18, w: 2, h: 7, static: true,
  },

  {
    i: 'chart', x: 2, y: 0, w: 8, h: 20, static: true,
  },
  {
    i: 'userOrders', x: 2, y: 12, w: 8, h: 12, static: true,
  },

  {
    i: 'tokenCard', x: 10, y: 0, w: 2, h: 3, static: true,
  },
  {
    i: 'buySell', x: 10, y: 3, w: 2, h: 9, static: true,
  },
  {
    i: 'history', x: 10, y: 15, w: 2, h: 12, static: true,
  },
];

export default () =>
  <ResponsiveReactGridLayout
    className="layout"
    layouts={{
      sm: layoutSm,
      md: layoutMd,
      lg: layoutLg,
      lg2: layoutLg2,
      lg3: layoutLg3,
    }}
    breakpoints={{
      sm: 0,
      md: 1000,
      lg: 1350,
      lg2: 1550,
      lg3: 2000,
    }}
    useCSSTransforms
    rowHeight={30}
    width="100vh"
    onLayoutChange={() => {}}
    cols={{
      sm: 2,
      md: 10,
      lg: 12,
      lg2: 24,
      lg3: 12,
    }}
  >
    <div key="tokenCard">
      <TokenCard />
    </div>
    <div key="balance">
      <UserBalance />
    </div>
    <div key="userOrders">
      <UserOrders />
    </div>

    <div key="chart">
      <TradingChart key="b1" />
    </div>

    <div key="orderBook">
      <OrderBook />
    </div>


    <div key="buySell">
      <BuySell key="c1" />
    </div>

    <div key="history">
      <TradingHistory key="c2" />
    </div>

  </ResponsiveReactGridLayout>;
