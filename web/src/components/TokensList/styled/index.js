import styled from 'styled-components';

export const TokenListContainer = styled.div`
  display: flex;
`;

export const Colored = styled.div`
  color: ${props => props.color || 'black'};
`;
