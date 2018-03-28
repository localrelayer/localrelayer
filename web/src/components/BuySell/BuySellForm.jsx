// @flow
import React from 'react';
import {
  reduxForm,
  Field,
  getFormValues,
} from 'redux-form';
import {
  Form,
  Popover,
  Icon,
} from 'antd';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import {
  connect,
} from 'react-redux';
import {
  compose,
} from 'redux';
import type {
  Node,
} from 'react';

import type {
  Token,
} from 'instex-core/types';
import type {
  MapStateToProps,
} from 'react-redux';
import {
  EXCHANGE_FEE,
  TRANSACTION_FEE,
} from 'instex-core/src/utils/web3';
import {
  NumberInput,
  DateInput,
} from '../ReduxFormComponents';
import {
  PlaceOrderButton,
  LabelContainer,
  LabelListContainer,
  AdditionInfoContainer,
} from './styled';

// eslint-disable-next-line
const parseNumber = val => (isNaN(parseFloat(val)) ? undefined : parseFloat(val));

const validate = (values, props) => {
  const errors = {};
  if (!values.amount || values.amount === 0) {
    errors.amount = 'Please enter amount';
  }
  if (!values.price || values.price === 0) {
    errors.price = 'Please enter price';
  }
  if (!values.exp) {
    errors.exp = 'Please enter expire date';
  }
  if (values.price && values.amount) {
    if (!/^-?\d+\.?\d*$/.test(values.price)) {
      errors.price = 'Please only numbers';
    }
    if (!/^-?\d+\.?\d*$/.test(values.amount)) {
      errors.amount = 'Please only numbers';
    }
    if (
      BigNumber(values.price)
        .times(values.amount)
        .lt(window.SMALLEST_AMOUNT || 0)
    ) {
      errors.amount = 'Order is too small :(';
    }
    if (
      BigNumber(values.price)
        .times(values.amount)
        .gt(window.BIGGEST_AMOUNT || 0)
    ) {
      errors.amount = "Order is too big, we can't process it :(";
    }
    if (props.type === 'sell' && BigNumber(values.amount).gt(props.currentToken.balance || 0)) {
      errors.amount = "You don't have the required amount";
    }
    if (
      props.type === 'buy' &&
      BigNumber(values.price)
        .times(values.amount)
        .gt(props.currentPair.balance || 0)
    ) {
      errors.amount = "You don't have the required amount";
    }
  }
  return errors;
};

type Props = {
  handleSubmit: () => void,
  currentToken: Token,
  currentPair: Token,
  type: string,
  fillField: (field: string, data: Object) => void,
  totalFee?: number,
  transactionFee?: number,
  exchangeFee?: number,
  total?: string,
};

function disabledDate(current) {
  return current && current < moment().subtract(1, 'hour');
}

/**
 * Buy/Sell form
 * @version 1.0.0
 * @author [Vladimir Pal](https://github.com/VladimirPal)
 */

const BuySellForm = ({
  handleSubmit,
  currentToken,
  currentPair,
  type,
  fillField,
  totalFee,
  total,
  transactionFee,
  exchangeFee,
}: Props): Node => (
  <Form layout="vertical" onSubmit={handleSubmit}>
    <Field
      id="price"
      type="text"
      name="price"
      parse={parseNumber}
      label={
        <LabelContainer>
          <div>Price</div>
          <LabelListContainer>
            <a onClick={() => fillField('price', { orderType: 'buy' })}>Buy</a>
            <a onClick={() => fillField('price', { orderType: 'sell' })}>Sell</a>
          </LabelListContainer>
        </LabelContainer>
      }
      placeholder={currentPair.symbol}
      component={NumberInput}
    />
    <Field
      id="amount"
      type="text"
      name="amount"
      parse={parseNumber}
      label={
        <LabelContainer>
          <div>Amount</div>
          <LabelListContainer>
            <a onClick={() => fillField('amount', { orderType: type, coef: '0.25' })}>25%</a>
            <a onClick={() => fillField('amount', { orderType: type, coef: '0.50' })}>50%</a>
            <a onClick={() => fillField('amount', { orderType: type, coef: '0.75' })}>75%</a>
            <a onClick={() => fillField('amount', { orderType: type, coef: '1' })}>100%</a>
          </LabelListContainer>
        </LabelContainer>
      }
      placeholder={currentToken.symbol}
      component={NumberInput}
    />
    <Field
      id="exp"
      type="text"
      name="exp"
      label={
        <LabelContainer>
          <div>Order expiration</div>
          <LabelListContainer>
            <a onClick={() => fillField('exp', { period: ['1', 'day'] })}>Day</a>
            <a onClick={() => fillField('exp', { period: ['7', 'days'] })}>Week</a>
            <a onClick={() => fillField('exp', { period: ['1', 'month'] })}>Month</a>
          </LabelListContainer>
        </LabelContainer>
      }
      showTime
      placeholder="Select time"
      dateFormat="DD/MM/YYYY HH:mm"
      disabledDate={disabledDate}
      component={DateInput}
    />
    <AdditionInfoContainer>
      <article>Total: {total} {currentPair.symbol}</article>
      <article>
        Fee: {totalFee} {type === 'sell' ? currentPair.symbol : currentToken.symbol}
        <Popover
          placement="bottom"
          title={
            <div>
              <div>
                  Ethereum tx fee: {transactionFee}{' '}
                {type === 'sell' ? currentPair.symbol : currentToken.symbol}
              </div>
              <div>
                  Instex fee: {exchangeFee}{' '}
                {type === 'sell' ? currentPair.symbol : currentToken.symbol}
              </div>
            </div>
            }
        >
          <Icon style={{ marginLeft: 3, marginTop: 3 }} type="info-circle-o" />
        </Popover>
      </article>
    </AdditionInfoContainer>
    <PlaceOrderButton size="large" type="primary" htmlType="submit">
      Place order
    </PlaceOrderButton>
  </Form>
);

BuySellForm.defaultProps = {
  total: '0.000000',
  transactionFee: 0.0,
  exchangeFee: 0.0,
  totalFee: 0.0,
};

const mapStateToProps: MapStateToProps<*, *, *> = (state, props) => {
  const { type } = props;
  const { amount = 0, price = 0 } = getFormValues('BuySellForm')(state) || {};
  const total = BigNumber(amount).times(price);

  let exchangeFee;
  let transactionFee;

  if (type === 'sell') {
    exchangeFee = BigNumber(total).times(EXCHANGE_FEE);
    transactionFee = price ? TRANSACTION_FEE : 0;
  } else {
    exchangeFee = BigNumber(amount).times(EXCHANGE_FEE);
    transactionFee = price ? BigNumber(TRANSACTION_FEE).div(price) : 0;
  }

  const totalFee = exchangeFee.add(transactionFee);

  return {
    total: total.toFixed(6),
    totalFee: totalFee.toFixed(6),
    exchangeFee: exchangeFee.toFixed(6),
    transactionFee: transactionFee.toFixed(6),
  };
};

export default compose(
  reduxForm({
    form: 'BuySellForm',
    touchOnChange: true,
    enableReinitialize: true,
    validate,
  }),
  connect(mapStateToProps),
)(BuySellForm);
