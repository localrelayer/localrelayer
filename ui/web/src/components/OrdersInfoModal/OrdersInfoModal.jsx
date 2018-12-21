// @flow
import React from 'react';

import {
  utils,
} from 'instex-core';
import * as S from './styled';

type Props = {
  isVisible: Boolean,
  onCancel: Function,
  onOk: Function,
  matchedOrders: Array<any>,
};

const OrdersInfoModal = (
  {
    isVisible,
    matchedOrders,
    onCancel,
    onOk,
  }: Props,
) => (
  <S.OrdersInfoModal
    title="You are going to fill following orders"
    closable={false}
    visible={isVisible}
    onCancel={() => onCancel(false)}
    onOk={() => onOk(true)}
    okText="Fill"
    destroyOnClose
  >
    {
      matchedOrders.length > 0 && (
        <S.OrdersList
          defaultActiveKey={matchedOrders.map(order => order.id)}
        >
          {
            matchedOrders.map(order => (
              <S.OrdersList.Panel
                header={(
                  <div>
                    Order
                    {' '}
                    (
                    {order.metaData.orderHash.slice(0, 8)}
                    ...)
                  </div>
                )}
                key={order.id}
              >
                <S.OrderInfo>
                  <S.OrderInfoKeys>
                    <div>
                      Pair
                    </div>
                    <div>
                      Price
                    </div>
                    <div>
                      Amount
                    </div>
                    <div>
                      Total
                    </div>
                    <div>
                      Expiration
                    </div>
                  </S.OrderInfoKeys>
                  <S.OrderInfoValues priceColor={order.color}>
                    <div>
                      {order.pair}
                    </div>
                    <div>
                      {order.price}
                    </div>
                    <div>
                      {order.amount}
                    </div>
                    <div>
                      {order.total}
                    </div>
                    <div>
                      {utils.formatDate('MM/DD/YYYY HH:mm', order.expirationTimeSeconds * 1000)}
                    </div>
                  </S.OrderInfoValues>
                </S.OrderInfo>
              </S.OrdersList.Panel>
            ))
          }
        </S.OrdersList>
      )
    }
  </S.OrdersInfoModal>
);

export default OrdersInfoModal;
