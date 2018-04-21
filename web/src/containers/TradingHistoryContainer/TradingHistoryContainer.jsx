// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Orders,
} from 'instex-core/types';

import {
  getCompletedOrders,
} from 'instex-core/selectors';
import TradingHistory from '../../components/TradingHistory';


type Props = {
  orders: Orders,
};

const TradingHistoryContainer: StatelessFunctionalComponent<Props> = ({
  orders,
}: Props): Node =>
  <TradingHistory
    orders={orders}
    pagination={{ pageSize: 7 }}
  />;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  orders: getCompletedOrders(state),
});

export default connect(mapStateToProps)(TradingHistoryContainer);
