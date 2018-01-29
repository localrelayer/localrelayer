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
  fillOrder as fillOrderAction,
} from 'instex-core/actions';
import {
  getBuyOrders,
  getSellOrders,
} from 'instex-core/selectors';
import OrderBook from '../../components/OrderBook';


type Props = {
  buyOrders: Orders,
  sellOrders: Orders,
  fillOrder: Function
};

const OrderBookContainer: StatelessFunctionalComponent<Props> =
  ({
    buyOrders,
    sellOrders,
    fillOrder,
  }: Props): Node =>
    <OrderBook
      fillOrder={({ zrxOrder }) => fillOrder(zrxOrder)}
      buyOrders={buyOrders}
      sellOrders={sellOrders}
    />;

const mapStateToProps = state => ({
  buyOrders: getBuyOrders(state),
  sellOrders: getSellOrders(state),
});

const mapDispatchToProps = {
  fillOrder: fillOrderAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderBookContainer);
