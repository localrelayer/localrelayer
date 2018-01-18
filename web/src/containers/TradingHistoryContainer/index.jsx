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
  getOrders,
} from 'instex-core/selectors';
import TradingHistory from '../../components/TradingHistory';


type Props = {
  orders: Orders,
};

const TradingChartContainer: StatelessFunctionalComponent<Props> = ({ orders }: Props): Node => (
  <TradingHistory
    orders={orders}
    onClick={record => console.log(record)}
    pagination={{ pageSize: 15 }}
  />
);

function mapStateToProps(state) {
  return {
    orders: getOrders(state),
  };
}

export default connect(mapStateToProps)(TradingChartContainer);
