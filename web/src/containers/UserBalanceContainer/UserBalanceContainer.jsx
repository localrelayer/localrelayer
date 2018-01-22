import React from 'react';
import UserBalance from '../../components/UserBalance';
import { testTokens } from '../../utils/mocks';
import { StyleContainer } from './styled';

export default () => (
  <StyleContainer>
    <UserBalance
      tokens={testTokens}
      onTokenClick={(...props) => console.log(...props)}
      onToggle={token => console.log(token)}
    />
  </StyleContainer>
);
