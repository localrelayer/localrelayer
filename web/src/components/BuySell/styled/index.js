import styled from 'styled-components';
import { Card, Button } from 'antd';

export const CardContainer = styled(Card)`
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
  position: relative;
`;

export const InputLabel = styled.label``;

export const PlaceOrderButton = styled(Button)`
  width: 100%;
`;

export const LabelContainer = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
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
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  & div {
    display: flex;
    justify-content: space-between;
  }
`;

