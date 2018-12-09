import styled from 'styled-components';

export const TransactionItemContent = styled.div`
  font-size: 12px;
`;

export const TransactionItemStatus = styled.div`
  color: ${props => (props.statuscolor)};
`;
