import styled from 'styled-components';

export const Colored = styled.span`
  color: ${props => props.color || 'black'};
`;

export const Truncate = styled.div`
  white-space: nowrap;
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
`;
