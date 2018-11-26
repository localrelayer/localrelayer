// @flow
import React from 'react';
import {
  Responsive,
  WidthProvider,
} from 'react-grid-layout';


const ResponsiveReactGridLayout = WidthProvider(Responsive);

const layoutXs = [
  {
    i: 'userBalance', x: 0, y: 0, w: 1, h: 5, static: true,
  },
  {
    i: 'userOrders', x: 0, y: 5, w: 1, h: 5, static: true,
  },
  {
    i: 'userTradingHistory', x: 0, y: 10, w: 1, h: 5, static: true,
  },
];


const layoutSm = [
  {
    i: 'userBalance', x: 0, y: 0, w: 2, h: 11, static: true,
  },
  {
    i: 'userOrders', x: 0, y: 11, w: 2, h: 11, static: true,
  },
  {
    i: 'userTradingHistory', x: 0, y: 22, w: 2, h: 11, static: true,
  },
];

const layoutMd = [
  {
    i: 'userBalance', x: 0, y: 0, w: 5, h: 22, static: true,
  },
  {
    i: 'userOrders', x: 5, y: 0, w: 5, h: 11, static: true,
  },
  {
    i: 'userTradingHistory', x: 5, y: 11, w: 5, h: 11, static: true,
  },
];

const layoutLg = [
  {
    i: 'userBalance', x: 0, y: 0, w: 6, h: 22, static: true,
  },
  {
    i: 'userOrders', x: 6, y: 0, w: 6, h: 11, static: true,
  },
  {
    i: 'userTradingHistory', x: 6, y: 10, w: 6, h: 11, static: true,
  },
];

const layoutLg2 = [
  {
    i: 'userBalance', x: 0, y: 0, w: 12, h: 22, static: true,
  },
  {
    i: 'userOrders', x: 12, y: 0, w: 12, h: 11, static: true,
  },
  {
    i: 'userTradingHistory', x: 12, y: 11, w: 12, h: 11, static: true,
  },
];

const layoutLg3 = [
  {
    i: 'userBalance', x: 0, y: 0, w: 6, h: 22, static: true,
  },
  {
    i: 'userOrders', x: 6, y: 0, w: 6, h: 11, static: true,
  },
  {
    i: 'userTradingHistory', x: 6, y: 11, w: 6, h: 11, static: true,
  },
];

type Props = {
  children: React.Node,
};

const UserProfileLayout = ({ children }: Props) => (
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

export default UserProfileLayout;
