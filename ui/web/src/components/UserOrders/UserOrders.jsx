// @flow
import React from 'react';
import {
  Icon,
  Tooltip,
} from 'antd';
import * as S from './styled';

type Props = {
  orders: Array<any>,
}
const columns = [{
  title: 'Pair',
  dataIndex: 'pair',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Created',
  dataIndex: 'metaData.createdAt',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Price',
  dataIndex: 'price',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Amount',
  dataIndex: 'amount',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Total',
  dataIndex: 'total',
  render: (text: string) => (
    <Tooltip title={text}>
      {text}
    </Tooltip>
  ),
}, {
  title: 'Status',
  key: 'status',
  render: (text, record) => (
    record.metaData.isShadowed
      ? (
        <Tooltip title="This order is shadowed read docs for more info">
          Unpublished
          <Icon
            style={{
              marginLeft: 5,
            }}
            type="info-circle-o"
          />
        </Tooltip>
      ) : (
        <Tooltip title="Published">
          Published
        </Tooltip>
      )
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
      Your open orders
      </div>
    </S.Title>
    <S.UserOrdersTable
      size="small"
      rowKey="id"
      onRow={record => ({
        ...(
          record.metaData.isShadowed
            ? {
              className: 'shadowed',
            } : {}
        ),
      })}
      columns={columns}
      dataSource={orders}
      pagination={false}
      scroll={{ y: 340 }}
    />
  </S.UserOrders>
);

export default UserOrders;
