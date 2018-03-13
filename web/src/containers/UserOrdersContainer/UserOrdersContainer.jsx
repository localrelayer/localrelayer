// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import type { Dispatch } from 'redux';
import type { MapStateToProps } from 'react-redux';
import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Orders,
} from 'instex-core/types';

import {
  getUserOrders,
} from 'instex-core/selectors';
import {
  cancelOrder,
} from 'instex-core/actions';

import UserOrders from '../../components/UserOrders';


type Props = {
  orders: Orders,
  dispatch: Dispatch<*>,
};

const UserOrdersContainer: StatelessFunctionalComponent<Props> = ({
  orders,
  dispatch,
}: Props): Node =>
  <UserOrders
    orders={orders}
    onCancel={(orderId: string) => {
      dispatch(cancelOrder(orderId));
    }}
  />;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  orders: getUserOrders(state),
});

export default connect(mapStateToProps)(UserOrdersContainer);
