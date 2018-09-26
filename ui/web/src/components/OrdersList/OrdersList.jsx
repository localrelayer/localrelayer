// @flow
import React from 'react';

import {
  Table,
  Pagination,
} from 'antd';

import type {
  Node,
} from 'react';
import type {
  Orders,
} from 'instex-core/types';

import {
  OrdersListContainer,
} from './styled';
import {
  ComponentTitle,
} from '../SharedStyles';

type Props = {
  /** Orders info */
  data: Orders,
  /** Title above table */
  title?: string,
  /**
   * List of columns
   * */
  columns: Array<Object>,
  /** Does table has borders */
  bordered?: boolean,
  /** Antd pagination config object */
  pagination: {
    pageSize: number,
    position?: string
  } | boolean | null,
  /** Called on row click */
  onClick: Function,
};


const OrdersList = ({
  data,
  title,
  columns,
  bordered,
  pagination,
  onClick,
  ...otherProps
}: Props): Node => (
  <OrdersListContainer>
    {
      title
      && (
        <ComponentTitle>
          {title}
        </ComponentTitle>
      )
    }
    <Table
      size="small"
      rowKey="id"
      bordered={bordered}
      columns={columns}
      dataSource={data}
      pagination={pagination.pageSize >= data.length ? false : pagination}
      onRow={record => ({
        onClick: () => onClick(record),
      })}
      {...otherProps}
    />
  </OrdersListContainer>
);

OrdersList.defaultProps = {
  title: '',
  bordered: false,
  pagination: {},
  onClick: () => {},
};

export default OrdersList;
