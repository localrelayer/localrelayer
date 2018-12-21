// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import Component from 'web-components/ConnectComponent';
import OrdersInfoModal from 'web-components/OrdersInfoModal';
import {
  uiActions,
} from 'web-actions';
import {
  getUiState,
} from 'web-selectors';
import {
  coreSelectors as cs,
  coreActions as ca,
} from 'instex-core';


const OrdersInfoModalContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      isVisible: getUiState('isOrdersInfoModalVisible')(state),
      matchedOrders: cs.getMatchedOrders(state),
    })}
  >
    {({
      isVisible,
      matchedOrders,
      dispatch,
    }) => (
      <OrdersInfoModal
        isVisible={isVisible}
        matchedOrders={matchedOrders}
        onCancel={(isConfirmed) => {
          dispatch(uiActions.setUiState({
            isOrdersInfoModalVisible: false,
          }));
          dispatch(ca.checkModalStatus({ isConfirmed }));
        }}
        onOk={(isConfirmed) => {
          dispatch(ca.checkModalStatus({ isConfirmed }));
          dispatch(uiActions.setUiState({
            isOrdersInfoModalVisible: false,
          }));
        }}
      />
    )}
  </Component>
);

export default OrdersInfoModalContainer;
