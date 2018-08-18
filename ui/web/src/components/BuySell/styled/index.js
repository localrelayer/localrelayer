import styled from 'styled-components';
import {
  Card,
  Button,
  Form,
} from 'antd';

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
  }
`;

export const AdditionInfoContainer = styled.div`
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  & div {
    display: flex;
    justify-content: space-between;
  }
`;

export const FormContainer = styled(Form)`
  .ant-form-item {
    margin-bottom: 10px;
  }
`;

export const ExtraContentContainer = styled.div`
  font-size: 0.75rem;
`;

