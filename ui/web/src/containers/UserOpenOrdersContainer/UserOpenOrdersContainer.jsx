// @flow
import React from 'react';

import type {
  Node,
} from 'react';
import * as webSelectors from 'web-selectors';
import {
  coreActions,
} from 'localrelayer-core';
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
      orders: webSelectors.getUserOpenOrdersFormatted(state),
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
