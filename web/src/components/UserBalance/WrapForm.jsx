// @flow
import React from 'react';
import {
  reduxForm,
  Field,
} from 'redux-form';
import {
  Form,
  Button,
} from 'antd';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';

import {
  NumberInput,
} from '../ReduxFormComponents';

import { InputGroupContainer } from './styled';

const validate = (values) => {
  const errors = {};
  if (!values.amount) {
    errors.amount = 'Please enter amount';
  } else if (values.amount <= 0) {
    errors.amount = 'Amount can be only positive';
  }
  return errors;
};

type Props = {
  wrap: () => void,
  unwrap: () => void,
  handleSubmit: (Function) => void,
};

/**
 * Ether Wrap/Unwrap form
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const WrapForm: StatelessFunctionalComponent<Props> = ({
  wrap,
  unwrap,
  handleSubmit,
}: Props): Node => (
  <Form onSubmit={handleSubmit}>
    <InputGroupContainer compact>
      <Field
        name="amount"
        component={NumberInput}
      />
      <Button.Group>
        <Button onClick={handleSubmit(unwrap)}>Withdraw</Button>
        <Button onClick={handleSubmit(wrap)}>Deposit</Button>
      </Button.Group>
    </InputGroupContainer>
  </Form>
);

export default reduxForm({
  form: 'WrapForm',
  touchOnBlur: true,
  touchOnChange: true,
  validate,
})(WrapForm);
