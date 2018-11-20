// @flow
import React from 'react';
import {
  Responsive,
  WidthProvider,
} from 'react-grid-layout';

import {
  layout as assetPairCardLayout,
} from 'web-components/AssetPairCard';
import {
  layout as tradingHistoryLayout,
} from 'web-components/TradingHistory';
import {
  layout as orderBookLayout,
} from 'web-components/OrderBook';
import {
  layout as userBalanceLayout,
} from 'web-components/UserBalance';
import {
  layout as buySellLayout,
} from 'web-components/BuySell';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const layoutXs = [
  assetPairCardLayout.xs,
  tradingHistoryLayout.xs,
  orderBookLayout.xs,
  userBalanceLayout.xs,
  buySellLayout.xs,
  {
    i: 'userOrders', x: 0, y: 34, w: 1, h: 11, static: false,
  },
  {
    i: 'tradingChart', x: 0, y: 0, w: 0, h: 0, static: false,
  },
];


const layoutSm = [
  assetPairCardLayout.sm,
  tradingHistoryLayout.sm,
  orderBookLayout.sm,
  userBalanceLayout.sm,
  buySellLayout.sm,
  {
    i: 'tradingChart', x: 0, y: 18, w: 2, h: 12, static: false,
  },
  {
    i: 'userOrders', x: 0, y: 30, w: 2, h: 11, static: false,
  },
];

const layoutMd = [
  assetPairCardLayout.md,
  tradingHistoryLayout.md,
  orderBookLayout.md,
  userBalanceLayout.md,
  buySellLayout.md,
  {
    i: 'tradingChart', x: 0, y: 0, w: 7, h: 10, static: false,
  },
  {
    i: 'userOrders', x: 3.5, y: 19, w: 6.5, h: 11, static: false,
  },
];

const layoutLg = [
  assetPairCardLayout.lg,
  tradingHistoryLayout.lg,
  orderBookLayout.lg,
  userBalanceLayout.lg,
  buySellLayout.lg,
  {
    i: 'tradingChart', x: 3, y: 0, w: 6, h: 14, static: false,
  },
  {
    i: 'userOrders', x: 3, y: 14, w: 6, h: 11, static: false,
  },
];

const layoutLg2 = [
  assetPairCardLayout.lg2,
  tradingHistoryLayout.lg2,
  orderBookLayout.lg2,
  userBalanceLayout.lg2,
  buySellLayout.lg2,
  {
    i: 'tradingChart', x: 5, y: 0, w: 14, h: 14, static: false,
  },
  {
    i: 'userOrders', x: 5, y: 14, w: 14, h: 11, static: false,
  },
];

const layoutLg3 = [
  assetPairCardLayout.lg3,
  tradingHistoryLayout.lg3,
  orderBookLayout.lg3,
  userBalanceLayout.lg3,
  buySellLayout.lg3,
  {
    i: 'tradingChart', x: 2, y: 0, w: 8, h: 20, static: false,
  },
  {
    i: 'userOrders', x: 2, y: 20, w: 8, h: 11, static: false,
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
  </ResponsiveReactGridLayout>
);

export default TrandgPageLayout;
