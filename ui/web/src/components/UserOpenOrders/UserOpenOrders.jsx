// @flow
import React, {
  useState,
} from 'react';
import {
  Icon,
  Input,
  Tooltip,
  Button,
} from 'antd';

import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import * as colors from 'web-styles/colors';
import * as S from './styled';


type Props = {
  orders: Array<any>,
  onOrderActionClick: Function,
}

const getColumns = onOrderActionClick => [
  {
    title: 'Pair',
    dataIndex: 'pair',
    render: (text: string) => (
      <Tooltip title={text}>
        {text}
      </Tooltip>
    ),
    defaultSortOrder: 'ascend',
    sorter: (a, b) => (a.pair >= b.pair ? 1 : -1),
  }, {
    title: 'Created',
    dataIndex: 'metaData.createdAt',
    render: (text: string) => (
      <Tooltip title={new Date(text).toLocaleString()}>
        {new Date(text).toLocaleString()}
      </Tooltip>
    ),
    sorter: (a, b) => (
      new Date(a.metaData.createdAt) - new Date(b.metaData.createdAt)
        ? 1
        : -1
    ),
  }, {
    title: 'Price',
    dataIndex: 'price',
    render: (
      text: string,
      record: any,
    ) => (
      <Tooltip title={text}>
        <ColoredSpan
          color={(
          record.action === 'Sell'
            ? colors.red
            : colors.green
        )}
        >
          {text}
        </ColoredSpan>
      </Tooltip>
    ),
    sorter: (a, b) => (a.price >= b.price ? 1 : -1),
  }, {
    title: 'Amount',
    dataIndex: 'amount',
    render: (text: string) => (
      <Tooltip title={text}>
        {text}
      </Tooltip>
    ),
    sorter: (a, b) => (a.amount >= b.amount ? 1 : -1),

  }, {
    title: 'Total',
    dataIndex: 'total',
    render: (text: string) => (
      <Tooltip title={text}>
        {text}
      </Tooltip>
    ),
    sorter: (a, b) => (a.total >= b.total ? 1 : -1),
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
    render: order => (
      <Button
        ghost
        size="small"
        onClick={() => {
          onOrderActionClick(order);
        }}
      >
        Cancel
      </Button>
    ),
  }];

const UserOpenOrders = ({
  orders,
  onOrderActionClick,
}: Props) => {
  const [searchText, setSearchText] = useState('');
  const s = searchText.toLowerCase();
  return (
    <S.UserOpenOrders>
      <S.Header>
        <S.SearchField>
          <Input
            value={searchText}
            onChange={ev => setSearchText(ev.target.value)}
            placeholder="Search by pair or status"
          />
        </S.SearchField>
        <S.Title>
          Your open orders
        </S.Title>
      </S.Header>
      <S.UserOpenOrdersTable
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
        columns={getColumns(onOrderActionClick)}
        dataSource={orders.filter(order => (
          searchText.length
            ? (
              order.pair.toLowerCase().includes(s)
              || (order.metaData.isShadowed ? 'Unpublished' : 'Published')
                .toLowerCase().includes(s)
            )
            : true
        ))}
        pagination={false}
        scroll={{ y: 340 }}
      />
    </S.UserOpenOrders>
  );
};

export default UserOpenOrders;
