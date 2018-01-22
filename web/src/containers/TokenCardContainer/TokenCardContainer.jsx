import React from 'react';
import TokenCard from '../../components/TokenCard';
import { getTestToken } from '../../utils/mocks';
import { StyleContainer } from './styled';

export default () => (
  <StyleContainer>
    <TokenCard token={getTestToken()} onClick={() => console.log('test')} />
  </StyleContainer>
);
