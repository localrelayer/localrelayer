// @flow

import React from 'react';
import {
  Icon,
} from 'antd';
import metamask from 'web-assets/metamask.png';
import * as S from '../styled';
import type {
  Props,
} from './Props';

const Wallet = ({
  isWeb3ProviderPresent,
  selectedAccount,
  networkName,
  nextStep,
}: Props) => (
  isWeb3ProviderPresent
    ? (
      <S.StepWrapper>
        <S.Title>Metamask Connected</S.Title>
        <S.NetworkName
          status="success"
          text={networkName}
        />
        <S.UserAddress>
          <Icon style={{ marginRight: 10 }} type="user" />
          {selectedAccount?.slice(0, 16)}
            ...
        </S.UserAddress>
        <S.Body>
          <S.Text>
          Your Metamask is connected. Make sure to have ETH in your wallet to trade.
          </S.Text>
          <S.Text>
          Select Deposit ETH or Enable Trading on the left to proceed.
          </S.Text>
          <S.NextButton onClick={nextStep}>
            Next Step
          </S.NextButton>
        </S.Body>
      </S.StepWrapper>
    )
    : (
      <S.StepWrapper>
        <S.Title>Connect a Wallet</S.Title>
        <S.Body>
          <S.Text>
            Please install Metamask to use an exchange
          </S.Text>
          <S.Text>
            <a rel="noopener noreferrer" target="_blank" href="https://metamask.io/">
              <S.TutorialImage src={metamask} alt="metamask" />
            </a>
          </S.Text>
          <S.NextButton disabled onClick={nextStep}>
            Next Step
          </S.NextButton>
        </S.Body>
      </S.StepWrapper>
    )
);

export default Wallet;
