// @flow
import React from 'react';
import {
  reduxForm,
  Field,
} from 'redux-form';
import {
  Form,
} from 'antd';

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
  /** Buy or sell */
  type: string,
};

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
      id="price"
      type="text"
      name="price"
      label="Price"
      placeholder="Price"
      component={NumberInput}
    />
    <Field
      id="amount"
      type="text"
      name="amount"
      label="Amount"
      placeholder="Amount"
      component={NumberInput}
    />
    <Field
      id="exp"
      type="text"
      name="exp"
      label="Order expiration"
      placeholder="Select time"
      dateFormat="YYYY-MM-DD HH:mm:ss"
      showTime
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
