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
  initialize,
  reset,
} from 'redux-form';
import {
  getBuyOrders,
  getSellOrders,
} from 'instex-core/selectors';
import {
  setUiState,
  showModal,
} from 'instex-core/actions';
import BigNumber from 'instex-core/src/utils/BigNumber';
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
      fillOrder={(orders) => {
        const activeOrders = orders.filter(order => order.status === 'new');

        const { type } = activeOrders[0];

        const totalAmount = activeOrders.reduce((acc, prev) => acc.add(prev.amount), BigNumber(0))
          .toNumber().toFixed(6);
        const totalPrice = BigNumber[type === 'sell' ? 'max' : 'min'](activeOrders.map(order => order.price));

        if (!activeOrders.length) {
          dispatch(showModal({
            type: 'info',
            title: 'Sorry, order is already taken',
          }));
        } else {
          dispatch(reset('BuySellForm'));
          dispatch(setUiState('activeTab', type === 'buy' ? 'sell' : 'buy'));
          dispatch(initialize('BuySellForm', {
            price: totalPrice,
            amount: totalAmount,
          }));
          dispatch(setUiState('shouldAnimate', true));
          setTimeout(() => {
            dispatch(setUiState('shouldAnimate', false));
          }, 500);
        }
      }}
      buyOrders={buyOrders}
      sellOrders={sellOrders}
    />;

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  buyOrders: getBuyOrders(state),
  sellOrders: getSellOrders(state),
});

export default connect(mapStateToProps)(OrderBookContainer);
