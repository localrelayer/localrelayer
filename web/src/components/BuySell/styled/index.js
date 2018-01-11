import styled from 'styled-components';
import {
  Card,
  Button,
} from 'antd';

export const CardContainer = styled(Card)`
  width: 400px;
  & .ant-card-head-title {
    text-align: center;
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
`;

export const InputLabel = styled.label``;

export const PlaceOrderButton = styled(Button)`
  width: 100%;
`;
