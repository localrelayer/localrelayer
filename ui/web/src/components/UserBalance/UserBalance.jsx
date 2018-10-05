// @flow
import React from 'react';
import {
  Icon,
  Tooltip,
  Popover,
  Switch,
  Button,
  Input,
} from 'antd';

import type {
  Node,
} from 'react';

import * as S from './styled';


const getColumns = onToggle => [
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (text, record) => (
      <div>
        <Tooltip title={record.name}>
          {text}
        </Tooltip>
        {record.symbol === 'WETH' && (
          <Popover
            placement="bottom"
            title={(
              <div>
                Wrapping ETH allows you to trade directly with alt tokens
              </div>
            )}
          >
            <Icon
              style={{
                marginLeft: 5,
              }}
              type="question-circle-o"
            />
          </Popover>
        )}
      </div>
    ),
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    render: (text, record) => (
      <div>
        {text}
        <Popover
          placement="bottom"
          title={(
            <div>
              <div>
                Wallet balance:
                {record.fullBalance}
              </div>
              <div>
                In orders:
                {(record.fullBalance - record.balance).toFixed(8)}
              </div>
            </div>
          )}
        >
          <Icon
            style={{
              marginLeft: 5,
            }}
            type="info-circle-o"
          />
        </Popover>
      </div>
    ),
  },
  {
    title: 'Tradable',
    key: 'tradable',
    render: (text, record) => (
      <Switch
        checked={record.isTradable}
        checkedChildren={(
          <Icon type="check" />
        )}
        onChange={checked => onToggle(checked, record)}
      />
    ),
  },
];

const UserBalance = ({
  assets,
  onToggle,
}: Props): Node => (
  <S.UserBalance>
    <S.Title>
      <div>Balance 3.00000000 ETH</div>
    </S.Title>
    <S.WrappingBar>
      <S.Amount>
        <Input
          addonAfter={<div>ETH</div>}
          placeholder="Amount"
        />
      </S.Amount>
      <S.UnwrapWrapBar>
        <Button.Group>
          <S.UnwrapButton type="primary">
          Unwrap
          </S.UnwrapButton>
          <S.WrapButton type="primary">
          Wrap
          </S.WrapButton>
        </Button.Group>
      </S.UnwrapWrapBar>
    </S.WrappingBar>
    <S.Table
      rowKey="symbol"
      dataSource={assets}
      columns={getColumns(onToggle)}
    />
  </S.UserBalance>
);

export default UserBalance;
