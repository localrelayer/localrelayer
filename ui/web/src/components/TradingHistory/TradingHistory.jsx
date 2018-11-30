// @flow
import React from 'react';
import {
  Tooltip,
  Icon,
} from 'antd';

import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import * as colors from 'web-styles/colors';
import * as S from './styled';


type Props = {
  orders: Array<any>,
  isTradingPage: boolean,
}

const getColumns = isTradingPage => [
  {
    title: 'Date',
    dataIndex: 'completedAt',
    render: (text: string) => (
      <Tooltip title={new Date(text).toLocaleString()}>
        {new Date(text).toLocaleString()}
      </Tooltip>
    ),
  },
  ...(
    !isTradingPage ? [{
      title: 'Type',
      dataIndex: 'type',
      render: text => (
        <div>
          <Tooltip title={text}>
            {text}
          </Tooltip>
        </div>
      ),
    }, {
      title: 'Pair',
      dataIndex: 'pair',
      render: text => (
        <div>
          <Tooltip title={text}>
            {text}
          </Tooltip>
        </div>
      ),
    }] : []
  ),
  {
    title: 'Price',
    dataIndex: 'price',
    render: (
      text: string,
      record: any,
    ) => (
      <Tooltip title={text}>
        <ColoredSpan
          color={(
            record.type === 'ask'
              ? colors.red
              : colors.green
          )}
        >
          {text}
        </ColoredSpan>
      </Tooltip>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    render: (text: string) => (
      <Tooltip title={text}>
        {text}
      </Tooltip>
    ),
  },
  ...(
    !isTradingPage ? [{
      title: 'Total',
      dataIndex: 'total',
      render: text => (
        <div>
          <Tooltip title={text}>
            {text}
          </Tooltip>
        </div>
      ),
    }, {
      title: 'Status',
      dataIndex: 'status',
      render: text => (
        <div>
          <Tooltip title={text}>
            {text}
          </Tooltip>
        </div>
      ),
    }] : []
  ),
  /* TODO: link to the etherscan */
  {
    render: () => <Icon type="select" />,
  },
];

const TradingHistory = ({
  orders,
  isTradingPage,
}: Props) => (
  <S.TradingHistory>
    <S.Title>
      <div>
        Trading history
      </div>
    </S.Title>
    <S.TradingHistoryTable
      size="small"
      columns={getColumns(isTradingPage)}
      pagination={false}
      dataSource={orders}
      scroll={{ y: 340 }}
    />
  </S.TradingHistory>
);

export default TradingHistory;
