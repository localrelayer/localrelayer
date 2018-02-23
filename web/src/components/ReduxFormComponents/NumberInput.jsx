import React, { Component } from 'react';
import {
  Form,
  InputNumber,
} from 'antd';

import type {
  FieldProps,
} from 'redux-form';

type Props = {
  input: FieldProps.input,
  label: string,
  meta: FieldProps.meta,
  placeholder: string,
};

export default class NumberInput extends Component<Props> {
  constructor(props) {
    super(props);
    this.input = null;
  }

  render() {
    const {
      input,
      label,
      placeholder,
      meta: {
        touched,
        error,
      },
    } = this.props;
    return (
      <Form.Item
        label={label}
        validateStatus={`${(error && touched) ? 'error' : ''}`}
        help={`${(error && touched) ? error : ''}`}
      >
        <InputNumber
          {...input}
          precision={6}
          step={0.1}
          min={0}
          style={{ width: '100%' }}
          placeholder={placeholder}
          ref={(el) => {
            this.input = el;
          }}
        />
      </Form.Item>
    );
  }
}
