import React from 'react';
import {
  Icon,
} from 'antd';

import * as S from './styled';


const ConnectingToEthProvider = () => (
  <S.EthMissMainWrapper>
    <S.MessageWrapper>
      <div>
        <Icon
          type="exclamation-circle"
          theme="filled"
        />
        You are not connected to Ethereum
        <div>
          Please
          <S.MetaMaskLink>
            download Metamask
          </S.MetaMaskLink>
          to use the exchange
        </div>
      </div>
    </S.MessageWrapper>
  </S.EthMissMainWrapper>

);

export default ConnectingToEthProvider;
