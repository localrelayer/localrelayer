// @flow
import React from 'react';
import {
  Icon,
  Tooltip,
  Switch,
  Button,
  Input,
  Form,
} from 'antd';
import {
  Formik,
} from 'formik';
import type {
  Node,
} from 'react';
import type {
  Asset,
} from 'instex-core';

import * as S from './styled';

type Props = {
  assets: Array<Asset>,
  balance: String,
  onToggleTradable: Function,
  onWithdraw: Function,
  onDeposit: Function,
  isTradingPage: boolean,
}

// use +n !== 0 because empty string (or spaced string) converts to 0
const isNumber = n => !isNaN(+n) && +n !== 0 && isFinite(n); /* eslint-disable-line */

const getColumns = (
  onToggleTradable,
  isTradingPage,
) => [
  {
    title: 'Token',
    dataIndex: 'symbol',
    render: (text, record) => (
      <div>
        <Tooltip title={record.name}>
          {text}
        </Tooltip>
        {record.symbol === 'WETH' && (
          <Tooltip
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
          </Tooltip>
        )}
      </div>
    ),
  },
  ...(
    !isTradingPage ? [{
      title: 'Name',
      dataIndex: 'name',
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
    title: 'Balance',
    dataIndex: 'balance',
    render: (text, record) => (
      <div>
        {text.length > 14 ? text.slice(0, 14) : text}
        <Tooltip
          placement="bottom"
          title={(
            <div>
              <div>
                <div>
                  Wallet balance:
                </div>
                {record.balance}
              </div>
              <div>
                <div>
                  In orders:
                </div>
                {record.balance}
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
        </Tooltip>
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
        onChange={checked => onToggleTradable(checked, record)}
      />
    ),
  },
  ...(
    !isTradingPage ? [{
      key: 'wallet_watchAsset',
      render: (text, record) => (
        <Icon
          type="wallet"
          onClick={() => {
            window.web3.currentProvider.sendAsync({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC20',
                options: {
                  ...record,
                },
              },
              id: Math.round(Math.random() * 100000),
            });
          }}
        />
      ),
    }] : []
  ),
];

const UserBalance = ({
  isTradingPage,
  assets,
  onToggleTradable,
  balance,
  onDeposit,
  onWithdraw,
}: Props): Node => (
  <S.UserBalance>
    <S.Title>
      <div>
        Balance
        {' '}
        {balance}
        {' '}
        ETH
      </div>
    </S.Title>
    <Formik
      isInitialValid
      validate={(values) => {
        const errors = {};
        if (values.amount.length && !isNumber(values.amount)) {
          errors.amount = 'Amount should be a number';
        }
        return errors;
      }}
    >
      {({
        handleChange,
        values,
        resetForm,
        errors,
        isValid,
      }) => (
        <S.WrappingBar>
          <S.Amount>
            <Form.Item
              validateStatus={errors.amount && 'error'}
              help={errors.amount}
            >
              <Input
                value={values.amount}
                name="amount"
                addonAfter={<div>ETH</div>}
                placeholder="Amount"
                onChange={handleChange}
                autoComplete="off"
              />
            </Form.Item>
          </S.Amount>
          <S.UnwrapWrapBar>
            <Button.Group>
              <S.UnwrapButton
                type="primary"
                disabled={
                  !isValid
                  || !values?.amount?.length
                }
                onClick={() => onWithdraw(values.amount, { resetForm })}
              >
                  Unwrap
              </S.UnwrapButton>
              <S.WrapButton
                type="primary"
                disabled={
                  !isValid
                  || !values?.amount?.length
                }
                onClick={() => onDeposit(values.amount, { resetForm })}
              >
                Wrap
              </S.WrapButton>
            </Button.Group>
          </S.UnwrapWrapBar>
        </S.WrappingBar>
      )}
    </Formik>
    <S.Table
      isTradingPage={isTradingPage}
      rowKey="address"
      dataSource={assets}
      columns={getColumns(
        onToggleTradable,
        isTradingPage,
      )}
    />
  </S.UserBalance>
);

export default UserBalance;
