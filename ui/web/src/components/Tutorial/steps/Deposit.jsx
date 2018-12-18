// @flow

import React from 'react';
import WrapForm from '../../UserBalance/WrapForm';
import * as S from '../styled';
import type {
  Props,
} from './Props';

const Deposit = ({
  balance,
  onDeposit,
  onWithdraw,
  nextStep,
  etherTokenBalance,
}: Props) => (
  <S.StepWrapper>
    <S.Title>Deposit your ETH</S.Title>
    <S.Text>
      Your balance is:
      {' '}
      {balance}
      {' '}
      ETH
      <br />
      WETH balance is:
      {' '}
      {etherTokenBalance}
    </S.Text>
    <WrapForm
      onDeposit={onDeposit}
      onWithdraw={onWithdraw}
    />
    <S.SmallText>
        Keep some ETH for transaction fees
    </S.SmallText>
    <S.Body>
      <S.Text>
        Wrapped ETH, known as WETH, is equivalent in value with ETH.
        You can unwrap WETH to ETH at any time.
      </S.Text>
      <S.NextButton onClick={nextStep}>
      Next Step
      </S.NextButton>
    </S.Body>
  </S.StepWrapper>
);

export default Deposit;
