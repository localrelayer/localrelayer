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
  getBuyOrders,
  getSellOrders,
} from 'instex-core/selectors';
import OrderBook from '../../components/OrderBook';


type Props = {
  buyOrders: Orders,
  sellOrders: Orders,
};

const OrderBookContainer: StatelessFunctionalComponent<Props> =
  ({
    buyOrders,
    sellOrders,
  }: Props): Node =>
    <OrderBook
      buyOrders={buyOrders}
      sellOrders={sellOrders}
    />;

const mapStateToProps = state => ({
  buyOrders: getBuyOrders(state),
  sellOrders: getSellOrders(state),
});

export default connect(mapStateToProps)(OrderBookContainer);
