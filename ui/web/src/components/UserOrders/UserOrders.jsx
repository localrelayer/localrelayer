// @flow
import React from 'react';
import {
  Tooltip,
} from 'antd';
import * as S from './styled';

type Props = {
  orders: Array<any>,
}
const columns = [{
  title: 'Pair',
  dataIndex: 'pair',
  key: 'pair',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Date',
  dataIndex: 'date',
  key: 'date',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Price',
  dataIndex: 'price',
  key: 'price',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Amount',
  dataIndex: 'amount',
  key: 'amount',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Total',
  dataIndex: 'total',
  key: 'total',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Status',
  dataIndex: 'status',
  key: 'status',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Action',
  dataIndex: 'action',
  key: 'action',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}];

const UserOrders = ({ orders }: Props) => (
  <S.UserOrders>
    <S.Title>
      <div>
      Opened orders
      </div>
    </S.Title>
    <S.UserOrdersTable
      size="small"
      columns={columns}
      dataSource={orders}
      pagination={false}
      scroll={{ y: 340 }}
    />
  </S.UserOrders>
);

export default UserOrders;
