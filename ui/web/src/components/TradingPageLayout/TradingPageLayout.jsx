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

const layoutsSizes = ['xs', 'sm', 'md', 'lg', 'lg2', 'lg3'];

const components = [
  assetPairCardLayout,
  orderBookLayout,
  userBalanceLayout,
  buySellLayout,
  userOpenOrdersLayout,
  tradingChartLayout,
];

const layouts = layoutsSizes.reduce((acc, cur) => {
  acc[cur] = components.map(component => component[cur]);
  return acc;
}, {});

type Props = {
  children: React.Node,
};

const TradingPageLayout = ({ children }: Props) => (
  <ResponsiveReactGridLayout
    layouts={layouts}
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

export default TradingPageLayout;
