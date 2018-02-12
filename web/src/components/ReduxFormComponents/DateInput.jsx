import React, { Component } from 'react';
import {
  Form,
  DatePicker,
} from 'antd';
import moment from 'moment';

import type {
  FieldProps,
} from 'redux-form';

type Props = {
  input: FieldProps.input,
  label: string,
  meta: FieldProps.meta,
  placeholder: string,
  showTime: boolean,
  dateFormat: string,
  disabledDate: string,
};

export default class DateInput extends Component<Props> {
  constructor(props) {
    super(props);
    this.input = null;
  }

  render() {
    const {
      input,
      label,
      placeholder,
      showTime,
      dateFormat,
      disabledDate,
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
        <DatePicker
          style={{ width: '100%' }}
          disabledDate={disabledDate}
          value={input.value || null}
          showTime={showTime}
          format={dateFormat}
          placeholder={placeholder}
          onChange={(data) => {
            input.onChange(data);
          }}
          ref={(el) => {
            this.input = el;
          }}
        />
      </Form.Item>
    );
  }
}
