// @flow
import React from 'react';
import {
  reduxForm,
  Field,
  getFormValues,
  isPristine,
} from 'redux-form';
import {
  Popover,
  Icon,
} from 'antd';
// import moment from 'moment';
import BigNumber from 'instex-core/src/utils/BigNumber';
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
  getTotal,
} from 'instex-core/selectors';
import {
  EXCHANGE_FEE,
  TRANSACTION_FEE,
} from 'instex-core/src/utils/web3';
import {
  AntNumberInput,
  // DateInput,
} from '../ReduxFormComponents';
import {
  PlaceOrderButton,
  LabelContainer,
  LabelListContainer,
  AdditionInfoContainer,
  FormContainer,
} from './styled';

// eslint-disable-next-line
const parseNumber = val => (isNaN(parseFloat(val)) ? undefined : parseFloat(val));

const validate = (values, props) => {
  const errors = {};
  if (!values.amount || values.amount === 0) {
    errors.amount = 'Please enter an amount';
  }
  if (!values.price || values.price === 0) {
    errors.price = 'Please enter a price';
  }
  if (values.price && !/^-?\d+\.?\d*$/.test(values.price)) {
    errors.price = 'Only numbers allowed';
  }
  if (values.amount && !/^-?\d+\.?\d*$/.test(values.amount)) {
    errors.amount = 'Only numbers allowed';
  }
  if (values.price && values.amount) {
    if (
      BigNumber(props.total)
        .lt(window.SMALLEST_AMOUNT || 0)
    ) {
      errors.amount = 'Order is too small :(';
    }
    // if (
    //   BigNumber(+values.price)
    //     .times(+values.amount)
    //     .gt(window.BIGGEST_AMOUNT || 0)
    // ) {
    //   errors.amount = "Order is too big, we can't process it :(";
    // }
    if (props.type === 'sell' && BigNumber(values.amount).gt(props.currentToken.balance || 0)) {
      errors.amount = "You don't have the required amount";
    }
    if (
      props.type === 'buy' &&
      BigNumber(props.total)
        .gt(BigNumber(+props.currentPair.balance || 0).add(+props.balance || 0))
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

// function disabledDate(current) {
//   return current && current < moment().subtract(1, 'hour');
// }

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
  <FormContainer layout="vertical" onSubmit={handleSubmit}>
    <Field
      id="price"
      type="text"
      name="price"
      // parse={parseNumber}
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
      addonAfter={currentPair.symbol}
      component={AntNumberInput}
    />
    <Field
      id="amount"
      type="text"
      name="amount"
      // parse={parseNumber}
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
      addonAfter={currentToken.symbol}
      component={AntNumberInput}
    />
    { /* <Field
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
    */ }
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
    <PlaceOrderButton
      className={`${type === 'buy' ? 'green-button' : 'red-button'}`}
      size="large"
      htmlType="submit"
    >
      {type === 'sell' ? `Sell ${currentToken.symbol || ''}` : `Buy ${currentToken.symbol || ''}`}
    </PlaceOrderButton>
  </FormContainer>
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
  // const total = BigNumber((+amount).toFixed(12)).times((+price).toFixed(12));
  const total = getTotal(state);
  const pristine = isPristine('BuySellForm')(state);
  const naiveTotal = BigNumber(+amount).times(+price).toFixed(6);

  let exchangeFee;
  let transactionFee;

  if (type === 'sell') {
    exchangeFee = BigNumber((+total).toFixed(12)).times(EXCHANGE_FEE);
    transactionFee = price ? TRANSACTION_FEE : 0;
  } else {
    exchangeFee = BigNumber((+amount).toFixed(12)).times(EXCHANGE_FEE);
    transactionFee = price ? BigNumber(TRANSACTION_FEE).div((+price).toFixed(12)) : 0;
  }

  const totalFee = exchangeFee.add(transactionFee);

  return {
    total: pristine ? total : naiveTotal,
    totalFee: totalFee.toFixed(6),
    exchangeFee: exchangeFee.toFixed(6),
    transactionFee: transactionFee.toFixed(6),
  };
};

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: 'BuySellForm',
    touchOnChange: true,
    validate,
  }),
)(BuySellForm);
