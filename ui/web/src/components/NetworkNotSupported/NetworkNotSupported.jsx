import React from 'react';
import {
  Icon,
} from 'antd';
import {
  utils,
} from 'instex-core';

import * as S from './styled';

const NetworkNotSupported = () => (
  <S.EthMissMainWrapper>
    <S.MessageWrapper>
      <div>
        <Icon
          type="exclamation-circle"
          theme="filled"
        />
        {' '}
        You are connected to not supported network
      </div>
      <S.SupportedNetworks>
        Please choose in your Web3 provider:
        {' '}
        {
          Object.keys(utils.networks)
            .filter(key => utils.networks[key].isSupported)
            .map(key => utils.networks[key].name)
            .join(', ')
        }
      </S.SupportedNetworks>
    </S.MessageWrapper>
  </S.EthMissMainWrapper>

);

export default NetworkNotSupported;
