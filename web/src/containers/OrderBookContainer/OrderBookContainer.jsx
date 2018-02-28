// @flow
import React from 'react';
import {
  connect,
} from 'react-redux';
import moment from 'moment';
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
  change,
} from 'redux-form';
import {
  getBuyOrders,
  getSellOrders,
} from 'instex-core/selectors';
import {
  setUiState,
} from 'instex-core/actions';
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
      fillOrder={(order) => {
        dispatch(setUiState('activeTab', order.type === 'buy' ? 'sell' : 'buy'));
        dispatch(change('BuySellForm', 'price', order.price)); // eslint-disable-line
        dispatch(change('BuySellForm', 'amount', order.amount)); // eslint-disable-line
        dispatch(change('BuySellForm', 'exp', moment().add(1, 'day'))); // eslint-disable-line
      }}
      buyOrders={buyOrders}
      sellOrders={sellOrders}
    />;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  buyOrders: getBuyOrders(state),
  sellOrders: getSellOrders(state),
});

export default connect(mapStateToProps)(OrderBookContainer);
