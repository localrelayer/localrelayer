import React from 'react';
import { Input, Tooltip, Form } from 'antd';

// function formatNumber(value) {
//   value += '';
//   const list = value.split('.');
//   const prefix = list[0].charAt(0) === '-' ? '-' : '';
//   let num = prefix ? list[0].slice(1) : list[0];
//   let result = '';
//   while (num.length > 3) {
//     result = `,${num.slice(-3)}${result}`;
//     num = num.slice(0, num.length - 3);
//   }
//   if (num) {
//     result = num + result;
//   }
//   return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
// }

type Props = {
  input: FieldProps.input,
  label: string,
  meta: FieldProps.meta,
  placeholder: string,
  disabled: boolean,
  formatter?: Function,
  addonAfter: any,
};


export default class AntNumericInput extends React.Component<Props> {
  onChange = (e) => {
    const { value } = e.target;
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      this.props.input.onChange(value);
    }
  };
  // '.' at the end or only '-' in the input box.
  onBlur = () => {
    const { value, onBlur, onChange } = this.props.input;
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      onChange({ value: value.slice(0, -1) });
    }
    if (onBlur) {
      onBlur();
    }
  };
  render() {
    const {
      input,
      label,
      placeholder,
      disabled,
      meta: {
        touched,
        error,
      },
    } = this.props;
    // const title = input.value ? (
    //   <span className="numeric-input-title">{input.value !== '-' ? formatNumber(input.value) : '-'}</span>
    // ) : (
    //   'Input a number'
    // );
    return (
      <Form.Item
        disabled={disabled}
        label={label}
        validateStatus={`${(error && touched) ? 'error' : ''}`}
        help={`${(error && touched) ? error : ''}`}
        style={{ width: '100%', display: 'inline-block' }}
      >
        {/* <Tooltip
          trigger={['focus']}
          title={title}
          placement="bottomLeft"
          overlayClassName="numeric-input"
        > */}
        <Input
          addonAfter={this.props.addonAfter}
          {...this.props.input}
          placeholder={placeholder}
          maxLength="16"
        />
        {/* </Tooltip> */}
      </Form.Item>
    );
  }
}
