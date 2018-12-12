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

type Props = {
  isTradingPage: Boolean,
}

const UserOpenOrdersContainer = (
  { isTradingPage }: Props,
): Node => (
  <Component
    mapStateToProps={state => ({
      orders: coreSelectors.getUserOpenOrders(state),
    })}
  >
    {({
      orders,
      dispatch,
    }) => (
      <UserOpenOrders
        orders={orders}
        isTradingPage={isTradingPage}
        onCancel={(order) => {
          dispatch(coreActions.cancelOrderRequest(order));
        }}
      />
    )}
  </Component>
);

export default UserOpenOrdersContainer;
