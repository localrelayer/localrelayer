import styled from 'styled-components';

export const OrderBookContainer = styled.div`
  display: flex;
`;

export const Colored = styled.div`
  color: ${props => props.color || 'black'};
`;
