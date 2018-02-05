// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import {
  bindActionCreators,
} from 'redux';

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
  cancelOrderAction: (orderId: string) => void,
};

const UserOrdersContainer: StatelessFunctionalComponent<Props> = ({
  orders,
  cancelOrderAction,
}: Props): Node =>
  <UserOrders
    orders={orders}
    onCancel={cancelOrderAction}
  />;

const mapStateToProps = state => ({
  orders: getUserOrders(state),
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    cancelOrderAction: cancelOrder,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UserOrdersContainer);
