import React from 'react';
import {
  Form,
  Input,
} from 'antd';

import type {
  FieldProps,
} from 'redux-form';

type Props = {
  input: FieldProps.input,
  label: string,
  meta: FieldProps.meta,
  placeholder: string,
  disabled: boolean,
};

export default ({
  input,
  label,
  placeholder,
  disabled,
  meta: {
    touched,
    error,
  },
}: Props) => (
  <Form.Item
    label={label}
    validateStatus={`${(error && touched) ? 'error' : ''}`}
    help={`${(error && touched) ? error : ''}`}
    style={{ width: '100%', display: 'inline-block' }}
  >
    <Input
      {...input}
      disabled={disabled}
      style={{ width: '100%' }}
      placeholder={placeholder}
    />
  </Form.Item>
);
