import React from 'react';
import { Select } from 'antd';
import { StyledSelect } from './styled';

const { Option } = Select;

type Props = {
  balance: string,
  address: string,
  network: string,
  addresses: Array<*>,
  onAddressSelect: Function,
};

export default ({
  balance,
  network,
  address,
  addresses,
  onAddressSelect,
}: Props) => (
  <div>
    <div>Balance: {balance || '0.00'} ETH</div>
    <div>Network: {network || 'Not available'}</div>
    <StyledSelect onChange={onAddressSelect} value={address}>
      {addresses.map(a => <Option key={a} value={a}>{a}</Option>)}
    </StyledSelect>
  </div>
);
