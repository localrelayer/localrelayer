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
  getCompletedUserOrders,
} from 'instex-core/selectors';
import {
  cancelOrder,
} from 'instex-core/actions';

import UserHistory from '../../components/UserHistory';


type Props = {
  orders: Orders,
  dispatch: Dispatch<*>,
};

const UserHistoryContainer: StatelessFunctionalComponent<Props> = ({
  orders,
  dispatch,
}: Props): Node =>
  <UserHistory
    title="Trading History"
    orders={orders}
    onCancel={(orderId: string) => {
      dispatch(cancelOrder(orderId));
    }}
  />;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  orders: getCompletedUserOrders(state),
});

export default connect(mapStateToProps)(UserHistoryContainer);
