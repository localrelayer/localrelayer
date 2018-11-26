// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  getOpenOrders,
} from 'web-selectors';
import Component from 'web-components/ConnectComponent';
import UserOrders from 'web-components/UserOrders';

const UserOrdersContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: getOpenOrders(state),
    })}
  >
    {({ orders }) => (
      <UserOrders
        orders={orders}
      />
    )}
  </Component>
);

export default UserOrdersContainer;
