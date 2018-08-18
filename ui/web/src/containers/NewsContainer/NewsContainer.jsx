// @flow
import React from 'react';
import type {
  MapStateToProps,
} from 'react-redux';
import type {
  Token,
} from 'instex-core/types';
import News from 'components/News';
import { StyleContainer } from './styled';

const NewsContainer = () => (
  <StyleContainer>
    <News />
  </StyleContainer>
);

export default NewsContainer;
