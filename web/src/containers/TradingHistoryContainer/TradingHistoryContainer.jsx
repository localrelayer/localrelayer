// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';


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

const TradingChartContainer: StatelessFunctionalComponent<Props> = ({
  orders,
}: Props): Node =>
  <TradingHistory
    orders={orders}
    pagination={{ pageSize: 15 }}
  />;

const mapStateToProps = state => ({
  orders: getCompletedOrders(state),
});

export default connect(mapStateToProps)(TradingChartContainer);
