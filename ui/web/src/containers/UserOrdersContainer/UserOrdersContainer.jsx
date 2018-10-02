// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors as cs,
} from 'instex-core';
import Component from 'web-components/ConnectComponent';
import UserOrders from 'web-components/UserOrders';

const UserOrdersContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: cs.getOpenOrders(state),
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
