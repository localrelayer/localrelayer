import styled from 'styled-components';
import { Card, Button } from 'antd';

export const CardContainer = styled(Card)`
  max-width: 400px;
  & .ant-card-head-title {
    text-align: center;
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
  & .ant-card-body {
    padding: 20px;
  }
  & .ant-card-meta-detail {
    text-align: center;
    padding-bottom: 10px;
  }
`;

export const InputLabel = styled.label``;

export const PlaceOrderButton = styled(Button)`
  width: 100%;
`;

export const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const LabelListContainer = styled.div`
  & a {
    text-decoration: underline;
    margin: 2.5px;
    opacity: 0.75;
  }
`;

export const AdditionInfoContainer = styled.div`
  margin-bottom: 20px;
  font-size: 0.75rem;
  & div {
    display: flex;
    justify-content: space-between;
  }
`;

