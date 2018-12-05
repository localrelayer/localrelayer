import styled from 'styled-components';

export const NotificationItemContent = styled.div`
  font-size: 12px;
`;

export const NotificationItemStatus = styled.div`
  color: ${props => (props.statuscolor)};
`;
