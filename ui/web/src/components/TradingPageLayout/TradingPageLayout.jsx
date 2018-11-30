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
import {
  layout as userOpenOrdersLayout,
} from 'web-components/UserOpenOrders';
import {
  layout as tradingChartLayout,
} from 'web-components/TradingChart';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const layoutXs = [
  assetPairCardLayout.xs,
  tradingHistoryLayout.xs,
  orderBookLayout.xs,
  userBalanceLayout.xs,
  buySellLayout.xs,
  userOpenOrdersLayout.xs,
  tradingChartLayout.xs,
];

const layoutSm = [
  assetPairCardLayout.sm,
  tradingHistoryLayout.sm,
  orderBookLayout.sm,
  userBalanceLayout.sm,
  buySellLayout.sm,
  userOpenOrdersLayout.sm,
  tradingChartLayout.sm,
];

const layoutMd = [
  assetPairCardLayout.md,
  tradingHistoryLayout.md,
  orderBookLayout.md,
  userBalanceLayout.md,
  buySellLayout.md,
  userOpenOrdersLayout.md,
  tradingChartLayout.md,
];

const layoutLg = [
  assetPairCardLayout.lg,
  tradingHistoryLayout.lg,
  orderBookLayout.lg,
  userBalanceLayout.lg,
  buySellLayout.lg,
  userOpenOrdersLayout.lg,
  tradingChartLayout.lg,
];

const layoutLg2 = [
  assetPairCardLayout.lg2,
  tradingHistoryLayout.lg2,
  orderBookLayout.lg2,
  userBalanceLayout.lg2,
  buySellLayout.lg2,
  userOpenOrdersLayout.lg2,
  tradingChartLayout.lg2,
];

const layoutLg3 = [
  assetPairCardLayout.lg3,
  tradingHistoryLayout.lg3,
  orderBookLayout.lg3,
  userBalanceLayout.lg3,
  buySellLayout.lg3,
  userOpenOrdersLayout.lg3,
  tradingChartLayout.lg3,
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
