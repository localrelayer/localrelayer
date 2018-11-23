// @flow
import React from 'react';
import {
  Tooltip,
} from 'antd';
import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import moment from 'moment';
import * as colors from 'web-styles/colors';
import * as S from './styled';

type Props = {
  orders: Array<any>,
}

const columns = [
  {
    title: 'Date',
    dataIndex: 'completedAt',
    key: 'date',
    render: (text: string) => (
      <Tooltip title={moment(text).format('ddd, MMM DD, YYYY hh:mm:ss A')}>
        {moment(text).format('DD/MM HH:mm')}
      </Tooltip>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    render: (text: string) => (
      text
    ),
  },
  {
    title: 'Pair',
    dataIndex: 'pair',
    key: 'pair',
    render: (text: string) => (
      <Tooltip title={text}>
        {text}
      </Tooltip>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (text: string, record) => (
      <Tooltip title={text}>
        <ColoredSpan
          color={record.type === 'ask' ? colors.red : colors.green}
        >
          {text.toFixed(6)}
        </ColoredSpan>
      </Tooltip>
    ),
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
    render: (text: string) => (
      <Tooltip title={text}>
        {text.toFixed(6)}
      </Tooltip>
    ),
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    render: (text: string) => (
      <Tooltip title={text}>
        {text.toFixed(6)}
      </Tooltip>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (text: string) => (
      <Tooltip title={text}>
        {text}
      </Tooltip>
    ),
  },
];

const UserTradingHistory = ({ orders }: Props) => (
  <S.TradingHistory>
    <S.Title>
      <div>
        My Trading history
      </div>
    </S.Title>
    <S.TradingHistoryTable
      size="small"
      columns={columns}
      pagination={false}
      dataSource={orders}
      scroll={{ y: 340 }}
    />
  </S.TradingHistory>
);

export default UserTradingHistory;
