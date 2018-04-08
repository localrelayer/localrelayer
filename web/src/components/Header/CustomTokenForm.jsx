import React from 'react';
import { Form } from 'antd';
import {
  Field,
  reduxForm,
} from 'redux-form';
import TextInput from 'components/ReduxFormComponents/TextInput';

const validate = (values) => {
  const errors = {};
  console.log(values);
  if (!values.address || !window.web3.utils.isAddress(values.address)) {
    errors.address = 'Please enter valid token address';
  }
  return errors;
};

const CustomTokenForm = () => (
  <Form style={{ marginTop: 20 }}>
    <Field
      id="address"
      type="text"
      name="address"
      placeholder="0x0"
      component={TextInput}
      label="Token address"
    />
  </Form>
);

export default reduxForm({
  form: 'CustomTokenForm',
  touchOnChange: true,
  enableReinitialize: true,
  destroyOnUnmount: true,
  validate,
})(CustomTokenForm);
