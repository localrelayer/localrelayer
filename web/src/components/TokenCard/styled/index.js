import styled from 'styled-components';
import { Card } from 'antd';

export const Colored = styled.span`
  color: ${props => props.color || 'black'};
`;

export const Title = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const CardContainer = styled(Card)`
  width: 400px;
`;
