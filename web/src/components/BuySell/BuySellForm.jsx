// @flow
import React from 'react';
import {
  reduxForm,
  Field,
} from 'redux-form';
import {
  Form,
} from 'antd';
import moment from 'moment';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';

import {
  NumberInput,
  DateInput,
} from '../ReduxFormComponents';
import {
  PlaceOrderButton,
  LabelContainer,
  LabelListContainer,
} from './styled';


type Props = {
  handleSubmit: () => void,
  currentTokenName: string,
  currentPairName: string,
  type: string,
  fillField: Function,
};

function disabledDate(current) {
  // Can not select days before today and today
  return current && current < moment().endOf('day');
}


/**
 * Buy/Sell form
 * @version 1.0.0
 * @author [Vladimir Pal](https://github.com/VladimirPal)
 */

const BuySellForm: StatelessFunctionalComponent<Props> = ({
  handleSubmit,
  currentTokenName,
  currentPairName,
  type,
  fillField,
}: Props): Node => (
  <Form
    layout="vertical"
    onSubmit={handleSubmit}
  >
    <Field
      id="price"
      type="text"
      name="price"
      label={
        <LabelContainer>
          <div>Price</div>
          <LabelListContainer>
            <a onClick={() => fillField('price', { orderType: 'buy' })}>Buy</a>
            <a onClick={() => fillField('price', { orderType: 'sell' })}>Sell</a>
          </LabelListContainer>
        </LabelContainer>
  }
      placeholder={currentPairName}
      component={NumberInput}
    />
    <Field
      id="amount"
      type="text"
      name="amount"
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
      placeholder={currentTokenName}
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
      placeholder="Select time"
      dateFormat="DD/MM/YYYY HH:mm"
      disabledDate={disabledDate}
      component={DateInput}
    />
    <PlaceOrderButton
      size="large"
      type="primary"
      htmlType="submit"
    >
      Place order
    </PlaceOrderButton>
  </Form>
);

export default reduxForm({
  form: 'BuySellForm',
  touchOnBlur: true,
  touchOnChange: true,
})(BuySellForm);
