// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import {
  coreSelectors,
  coreActions,
} from 'instex-core';
import Component from 'web-components/ConnectComponent';
import UserOpenOrders from 'web-components/UserOpenOrders';


const UserOpenOrdersContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      orders: coreSelectors.getOpenOrders(state),
    })}
  >
    {({
      orders,
      dispatch,
    }) => (
      <UserOpenOrders
        orders={orders}
        onCancel={(order) => {
          dispatch(coreActions.cancelOrderRequest(order));
        }}
      />
    )}
  </Component>
);

export default UserOpenOrdersContainer;
