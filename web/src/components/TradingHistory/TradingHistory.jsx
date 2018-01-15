// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import type { Order } from 'instex-core/types';

import { TradingHistoryContainer } from './styled';
import { Colored } from '../SharedStyles';
import OrdersList from '../OrdersList';

type Props = {
  /** List of all orders */
  orders: Array<Order>,
  /**
   * Function that is called whenever order clicked
   * */
  onClick: Function,
};

const columns = [
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: (text: string, record) => (
      <Colored color={record.action === 'sell' ? 'red' : 'green'}>{text}</Colored>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
];

/**
 * Trading History
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TradingHistory: StatelessFunctionalComponent<Props> = (props: Props): Node => {
  const { orders, onClick } = props;

  return (
    <TradingHistoryContainer>
      <OrdersList
        {...props}
        title="Trading History"
        columns={columns}
        data={orders}
        onClick={onClick}
      />
    </TradingHistoryContainer>
  );
};

export default TradingHistory;
