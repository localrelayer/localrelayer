// @flow

import React from 'react';
import { connect } from 'react-redux';
import type { MapStateToProps } from 'react-redux';
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

const TokenCardContainer = ({ token, tokenPair }: Props) => (
  <StyleContainer>
    <TokenCard
      token={token}
      tokenPair={tokenPair}
    />
  </StyleContainer>
);

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  token: getCurrentToken(state),
  tokenPair: getCurrentPair(state),
});

export default connect(mapStateToProps)(TokenCardContainer);
