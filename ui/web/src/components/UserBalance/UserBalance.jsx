// @flow
import React from 'react';
import {
  Icon,
  Tooltip,
  Popover,
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
}

// use +n !== 0 because empty string (or spaced string) converts to 0
const isNumber = n => !isNaN(+n) && +n !== 0 && isFinite(n); /* eslint-disable-line */

const getColumns = onToggleTradable => [
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
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    render: (text, record) => (
      <div>
        {text.length > 6 ? text.slice(0, 6).concat(' ...') : text}
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
];

const UserBalance = ({
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
        if (!values.amount) {
          errors.amount = 'Required';
        } else if (!isNumber(values.amount)) {
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
        touched,
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
                disabled={touched && !isValid}
                onClick={() => onWithdraw(values.amount) && resetForm({})}
              >
                  Unwrap
              </S.UnwrapButton>
              <S.WrapButton
                type="primary"
                disabled={touched && !isValid}
                onClick={() => onDeposit(values.amount) && resetForm({})}
              >
                Wrap
              </S.WrapButton>
            </Button.Group>
          </S.UnwrapWrapBar>
        </S.WrappingBar>
      )}
    </Formik>
    <S.Table
      rowKey="symbol"
      dataSource={assets}
      columns={getColumns(onToggleTradable)}
    />
  </S.UserBalance>
);

export default UserBalance;
