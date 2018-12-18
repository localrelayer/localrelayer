// @flow

import React from 'react';
import * as S from '../styled';
import logo from '../../../assets/logo5.png';
import type {
  Props,
} from './Props';

const Overview = ({ nextStep }: Props) => (
  <S.StepWrapper>
    <S.Title>Welcome</S.Title>
    <S.TutorialImage src={logo} alt="LOGO" />
    <S.Body>
      <S.Text>
      We are wallet-to-wallet trading platform that will help you to sell and buy any ERC20 token
      </S.Text>
      <S.Text>
      You need to follow 3 simple steps to start trading on Instex
      </S.Text>
      <S.Text style={{ fontSize: '0.7rem' }}>
        BTW: we take no fees at the moment
      </S.Text>
      <S.NextButton onClick={nextStep}>
        Let’s start
      </S.NextButton>
    </S.Body>
  </S.StepWrapper>
);

export default Overview;
