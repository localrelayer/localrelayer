// @flow
import React from 'react';
import {
  reduxForm,
  Field,
} from 'redux-form';
import {
  Button,
} from 'antd';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';

import {
  NumberInput,
} from '../ReduxFormComponents';

import {
  InputGroupContainer,
  FormContainer,
} from './styled';

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
  isLoading: boolean,
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
  isLoading,
}: Props): Node => (
  <FormContainer onSubmit={handleSubmit}>
    <InputGroupContainer compact>
      <Field
        parse={val => (isNaN(parseFloat(val)) ? null : parseFloat(val))}
        name="amount"
        component={NumberInput}
      />
      <Button.Group>
        <Button disabled={isLoading} onClick={handleSubmit(unwrap)}>Withdraw</Button>
        <Button disabled={isLoading} onClick={handleSubmit(wrap)}>Deposit</Button>
      </Button.Group>
    </InputGroupContainer>
  </FormContainer>
);

export default reduxForm({
  form: 'WrapForm',
  touchOnBlur: true,
  touchOnChange: true,
  validate,
})(WrapForm);
