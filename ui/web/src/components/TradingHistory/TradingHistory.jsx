// @flow
import React from 'react';
import {
  Tooltip,
  Icon,
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
    dataIndex: 'date',
    render: (text: string) => (
      <Tooltip title={moment(text).format('ddd, MMM DD, YYYY hh:mm:ss A')}>
        {moment(text).format('DD/MM/YYYY HH:mm')}
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
          {Number(text).toFixed(8)}
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
        {Number(text).toFixed(6)}
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
