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
}

const columns = [
  {
    title: 'Date',
    dataIndex: 'completedAt',
    render: (text: string) => (
      <Tooltip title={new Date(text).toLocaleString()}>
        {new Date(text).toLocaleString()}
      </Tooltip>
    ),
  },
  {
    title: 'Price',
    dataIndex: 'price',
    render: (text: string, record) => (
      <Tooltip title={text}>
        <ColoredSpan
          color={record.type === 'ask' ? colors.red : colors.green}
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
  {
    render: () => <Icon type="select" />,
  },
];

const TradingHistory = ({ orders }: Props) => (
  <S.TradingHistory>
    <S.Title>
      <div>
        Trading history
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

export default TradingHistory;
