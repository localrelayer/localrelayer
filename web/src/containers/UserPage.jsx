import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import UserTotalBalance from './UserTotalBalanceContainer';
import UserOrders from './UserOrdersContainer';
import UserHistory from './UserHistoryContainer';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const layout = [
  {
    i: 'userBalance', x: 0, y: 0, w: 6, h: 18, static: true,
  },
  {
    i: 'userHistory', x: 6, y: 0, w: 6, h: 10, static: true,
  },
  {
    i: 'UserOrders', x: 6, y: 10, w: 6, h: 12, static: true,
  },
];

export default () => (
  <ResponsiveReactGridLayout
    className="layout"
    layouts={{ lg: layout }}
    useCSSTransforms
    rowHeight={30}
    width="100vh"
    onLayoutChange={() => {}}
    cols={{ lg: 12 }}
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
