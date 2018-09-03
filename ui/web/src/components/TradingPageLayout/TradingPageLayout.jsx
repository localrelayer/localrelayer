// @flow
import React from 'react';
import {
  Responsive,
  WidthProvider,
} from 'react-grid-layout';

import {
  layout as assetPairCardLayout,
} from 'web-components/AssetPairCard';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const layoutXs = [
  assetPairCardLayout.xs,
  {
    i: 'buySell', x: 1, y: 3, w: 1, h: 9, static: true,
  },
  {
    i: 'orderBook', x: 0, y: 12, w: 1, h: 16, static: true,
  },
  {
    i: 'balance', x: 1, y: 28, w: 1, h: 6, static: true,
  },
  {
    i: 'history', x: 0, y: 45, w: 1, h: 11, static: true,
  },
  {
    i: 'userOrders', x: 0, y: 34, w: 1, h: 11, static: true,
  },
  {
    i: 'chart', x: 0, y: 0, w: 0, h: 0, static: true,
  },
  {
    i: 'news', x: 0, y: 56, w: 1, h: 7, static: true,
  },
];


const layoutSm = [
  {
    i: 'orderBook', x: 1, y: 0, w: 1, h: 18, static: true,
  },
  {
    i: 'balance', x: 0, y: 3, w: 1, h: 6, static: true,
  },

  {
    i: 'chart', x: 0, y: 18, w: 2, h: 12, static: true,
  },
  {
    i: 'userOrders', x: 0, y: 30, w: 2, h: 11, static: true,
  },
  {
    i: 'assetPairCard', x: 0, y: 0, w: 1, h: 3, static: true,
  },
  {
    i: 'buySell', x: 0, y: 3, w: 1, h: 9, static: true,
  },
  {
    i: 'history', x: 0, y: 41, w: 2, h: 11, static: true,
  },
  {
    i: 'news', x: 0, y: 52, w: 1, h: 7, static: true,
  },
];

const layoutMd = [
  {
    i: 'orderBook', x: 7, y: 0, w: 3, h: 19, static: true,
  },
  {
    i: 'balance', x: 0, y: 13, w: 3.5, h: 6, static: true,
  },

  {
    i: 'chart', x: 0, y: 0, w: 7, h: 10, static: true,
  },
  {
    i: 'userOrders', x: 3.5, y: 19, w: 6.5, h: 11, static: true,
  },
  {
    i: 'assetPairCard', x: 0, y: 10, w: 3.5, h: 3, static: true,
  },
  {
    i: 'buySell', x: 3.5, y: 10, w: 3.5, h: 9, static: true,
  },
  {
    i: 'history', x: 0, y: 19, w: 3.5, h: 11, static: true,
  },
  {
    i: 'news', x: 0, y: 30, w: 3.5, h: 7, static: true,
  },

];

const layoutLg = [
  {
    i: 'orderBook', x: 9, y: 0, w: 3, h: 14, static: true,
  },
  {
    i: 'balance', x: 0, y: 12, w: 3, h: 6, static: true,
  },
  {
    i: 'news', x: 0, y: 18, w: 3, h: 7, static: true,
  },

  {
    i: 'chart', x: 3, y: 0, w: 6, h: 14, static: true,
  },
  {
    i: 'userOrders', x: 3, y: 14, w: 6, h: 11, static: true,
  },

  {
    i: 'assetPairCard', x: 0, y: 0, w: 3, h: 3, static: true,
  },
  {
    i: 'buySell', x: 0, y: 3, w: 3, h: 9, static: true,
  },
  {
    i: 'history', x: 9, y: 14, w: 3, h: 11, static: true,
  },
];

const layoutLg2 = [
  {
    i: 'orderBook', x: 19, y: 0, w: 5, h: 14, static: true,
  },
  {
    i: 'balance', x: 0, y: 12, w: 5, h: 7, static: true,
  },

  {
    i: 'chart', x: 5, y: 0, w: 14, h: 14, static: true,
  },
  {
    i: 'userOrders', x: 5, y: 14, w: 14, h: 11, static: true,
  },

  {
    i: 'assetPairCard', x: 0, y: 0, w: 5, h: 3, static: true,
  },
  {
    i: 'buySell', x: 0, y: 3, w: 5, h: 9, static: true,
  },
  {
    i: 'history', x: 19, y: 14, w: 5, h: 11, static: true,
  },
  {
    i: 'news', x: 0, y: 19, w: 5, h: 7, static: true,
  },
];

const layoutLg3 = [
  {
    i: 'orderBook', x: 10, y: 0, w: 2, h: 20, static: true,
  },
  {
    i: 'balance', x: 0, y: 12, w: 2, h: 7, static: true,
  },

  {
    i: 'chart', x: 2, y: 0, w: 8, h: 20, static: true,
  },
  {
    i: 'userOrders', x: 2, y: 20, w: 8, h: 11, static: true,
  },

  {
    i: 'assetPairCard', x: 0, y: 0, w: 2, h: 3, static: true,
  },
  {
    i: 'buySell', x: 0, y: 3, w: 2, h: 9, static: true,
  },
  {
    i: 'history', x: 10, y: 20, w: 2, h: 11, static: true,
  },
  {
    i: 'news', x: 0, y: 19, w: 2, h: 7, static: true,
  },
];

type Props = {
  children: React.Node,
};

const TrandgPageLayout = ({ children }: Props) => (
  <ResponsiveReactGridLayout
    layouts={{
      xs: layoutXs,
      sm: layoutSm,
      md: layoutMd,
      lg: layoutLg,
      lg2: layoutLg2,
      lg3: layoutLg3,
    }}
    breakpoints={{
      xs: 0,
      sm: 600,
      md: 1000,
      lg: 1350,
      lg2: 1550,
      lg3: 2000,
    }}
    cols={{
      xs: 1,
      sm: 2,
      md: 10,
      lg: 12,
      lg2: 24,
      lg3: 12,
    }}
    useCSSTransforms
    width="100vh"
    rowHeight={30}
    onLayoutChange={() => {}}
  >
    {children}
    {/*
    <div key="assetPairCard">
      <AssetPairCard />
    </div>

    <div key="balance">
      <UserBalance />
    </div>
    <div key="userOrders">
      <UserOrders />
    </div>

    <div key="chart">
      <TradingChart />
    </div>

    <div key="orderBook">
      <OrderBook />
    </div>


    <div key="buySell">
      <BuySell />
    </div>

    <div key="history">
      <TradingHistory />
    </div>

    <div key="news">
      <News />
    </div>
    */}
  </ResponsiveReactGridLayout>
);

export default TrandgPageLayout;
