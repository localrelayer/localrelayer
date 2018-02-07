// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import type { MapStateToProps } from 'react-redux';
import type { Dispatch } from 'redux';
import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Orders,
} from 'instex-core/types';
import {
  fillOrder,
} from 'instex-core/actions';
import {
  getBuyOrders,
  getSellOrders,
} from 'instex-core/selectors';
import OrderBook from '../../components/OrderBook';


type Props = {
  buyOrders: Orders,
  sellOrders: Orders,
  dispatch: Dispatch<*>,
};

const OrderBookContainer: StatelessFunctionalComponent<Props> =
  ({
    buyOrders,
    sellOrders,
    dispatch,
  }: Props): Node =>
    <OrderBook
      fillOrder={({ zrxOrder }) => dispatch(fillOrder(zrxOrder))}
      buyOrders={buyOrders}
      sellOrders={sellOrders}
    />;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  buyOrders: getBuyOrders(state),
  sellOrders: getSellOrders(state),
});

export default connect(mapStateToProps)(OrderBookContainer);
