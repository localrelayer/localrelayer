import styled from 'styled-components';
import * as colors from 'web-styles/colors';

export const EthMissMainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  border: 2px solid #0F2335;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: ${colors['body-background']};
`;

export const MessageWrapper = styled.div`
  display: flex;
  text-align: center;
  color: white;
  flex-direction: column;
`;


export const SupportedNetworks = styled.div`
  display: flex;
`;
