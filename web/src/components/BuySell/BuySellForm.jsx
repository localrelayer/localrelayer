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
} from './styled';


type Props = {
  handleSubmit: () => void,
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
}: Props): Node => (
  <Form onSubmit={handleSubmit}>
    <Field
      id="amount"
      type="text"
      name="amount"
      label="Amount"
      placeholder="Amount"
      component={NumberInput}
    />
    <Field
      id="price"
      type="text"
      name="price"
      label="Price"
      placeholder="Price"
      component={NumberInput}
    />
    <Field
      id="exp"
      type="text"
      name="exp"
      label="Order expiration"
      placeholder="Select time"
      dateFormat="YYYY-MM-DD HH:mm:ss"
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
