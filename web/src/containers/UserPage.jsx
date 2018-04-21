import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import UserTotalBalance from './UserTotalBalanceContainer';
import UserOrders from './UserOrdersContainer';
import UserHistory from './UserHistoryContainer';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const layout = [
  {
    i: 'userBalance', x: 0, y: 0, w: 6, h: 16, static: true,
  },
  {
    i: 'userHistory', x: 6, y: 0, w: 6, h: 11, static: true,
  },
  {
    i: 'UserOrders', x: 6, y: 12, w: 6, h: 11, static: true,
  },
];

const layoutSm = [
  {
    i: 'userBalance', x: 0, y: 0, w: 2, h: 16, static: true,
  },
  {
    i: 'userHistory', x: 6, y: 16, w: 2, h: 8, static: true,
  },
  {
    i: 'UserOrders', x: 6, y: 24, w: 2, h: 8, static: true,
  },
];

export default () => (
  <ResponsiveReactGridLayout
    className="layout"
    layouts={{
      lg: layout,
      md: layout,
      sm: layoutSm,
      xs: layoutSm,
      xxs: layoutSm,
    }}
    useCSSTransforms
    rowHeight={30}
    width="100vh"
    onLayoutChange={() => {}}
    cols={{
      lg: 12,
      md: 6,
      sm: 2,
      xs: 2,
      xxs: 1,
    }}
  >
    <div key="userBalance">
      <UserTotalBalance />
    </div>
    <div key="userHistory">
      <UserHistory />
    </div>
    <div key="UserOrders">
      <UserOrders />
    </div>
  </ResponsiveReactGridLayout>
);
