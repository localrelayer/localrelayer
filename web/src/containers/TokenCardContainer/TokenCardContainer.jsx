import React from 'react';
import { connect } from 'react-redux';
import {
  getCurrentToken,
  getCurrentPair,
} from 'instex-core/selectors';
import type { Token } from 'instex-core/types';
import TokenCard from '../../components/TokenCard';
import { StyleContainer } from './styled';

type Props = {
  token: Token,
  tokenPair: Token
}

const mapStateToProps = state => ({
  token: getCurrentToken(state),
  tokenPair: getCurrentPair(state),
});

const TokenCardContainer = ({ token, tokenPair }: Props) => (
  <StyleContainer>
    <TokenCard
      token={token}
      tokenPair={tokenPair}
      onClick={() => console.log('test')}
    />
  </StyleContainer>
);

export default connect(mapStateToProps, {})(TokenCardContainer);
