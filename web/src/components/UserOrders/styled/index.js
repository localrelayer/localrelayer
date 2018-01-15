import styled from 'styled-components';

export const UserOrdersContainer = styled.div`
  display: flex;
`;

export const Colored = styled.div`
  color: ${props => props.color || 'black'};
`;
