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
  utils,
} from 'localrelayer-core';
import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import * as colors from 'web-styles/colors';
import Measure from 'react-measure';
import * as S from './styled';


type Props = {
  orders: Array<any>,
  onCancel: Function,
  isTradingPage: Boolean,
}

const getColumns = onCancel => [
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
    render: (text: string, record: any) => (
      <Tooltip title={record.createdAtFormattedLong}>
        {record.createdAtFormattedShort}
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
          {text.slice(0, 12)}
        </ColoredSpan>
      </Tooltip>
    ),
    sorter: (a, b) => (+a.price >= +b.price ? 1 : -1),
  }, {
    title: 'Amount',
    dataIndex: 'amount',
    render: (text: string) => (
      <Tooltip title={text}>
        {text.slice(0, 12)}
      </Tooltip>
    ),
    sorter: (a, b) => (+a.amount >= +b.amount ? 1 : -1),

  }, {
    title: 'Total',
    dataIndex: 'total',
    render: (text: string) => (
      <Tooltip title={text}>
        {text.slice(0, 12)}
      </Tooltip>
    ),
    sorter: (a, b) => (+a.total >= +b.total ? 1 : -1),
  }, {
    title: 'Status',
    key: 'status',
    render: (text, record) => (
      record.metaData.isShadowed
        ? (
          <Tooltip title={utils.zeroExErrToHumanReadableErrMsg(record.metaData.error)}>
          Unpublished
            <Icon
              style={{
                marginLeft: 5,
              }}
              type="info-circle-o"
            />
          </Tooltip>
        ) : (
          <div>Published</div>
        )
    ),
  }, {
    title: 'Action',
    render: order => (
      <Button
        ghost
        loading={order.isCancelPending}
        size="small"
        onClick={() => {
          onCancel(order);
        }}
      >
        Cancel
      </Button>
    ),
  }];

const UserOpenOrders = ({
  orders,
  onCancel,
  isTradingPage,
}: Props) => {
  const [searchText, setSearchText] = useState('');
  const [dimensions, setDimensions] = useState('');
  const s = searchText.toLowerCase();
  return (
    <Measure
      bounds
      onResize={(contentRect) => {
        setDimensions(contentRect.bounds);
      }}
    >
      {({ measureRef }) => (
        <div style={{ height: '100%' }} ref={measureRef}>
          <S.UserOpenOrders>
            {!isTradingPage
            && (
              <S.Header>
                <S.Title>
                  Open orders
                </S.Title>
                <S.SearchField>
                  <Input
                    value={searchText}
                    onChange={ev => setSearchText(ev.target.value)}
                    placeholder="Search by pair or status"
                  />
                </S.SearchField>
              </S.Header>
            )
            }
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
              columns={getColumns(onCancel)}
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
              scroll={isTradingPage
                ? { y: dimensions.height - 75 }
                : { y: dimensions.height - 100 }}
            />
          </S.UserOpenOrders>
        </div>
      )}
    </Measure>
  );
};

export default UserOpenOrders;
