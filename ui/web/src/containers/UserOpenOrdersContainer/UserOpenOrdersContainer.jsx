// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getOpenOrders,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import UserOpenOrders from 'web-components/UserOpenOrders';

const UserOpenOrdersContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: getOpenOrders(state),
    })}
  >
    {({ orders }) => (
      <UserOpenOrders
        orders={orders}
      />
    )}
  </Component>
);

export default UserOpenOrdersContainer;
