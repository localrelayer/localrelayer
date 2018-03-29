import styled from 'styled-components';
import {
  Card,
  Table,
  Input,
  Form,
} from 'antd';

const InputGroup = Input.Group;

export const Title = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const CardContainer = styled(Card)`
  padding: 0;
  min-height: 223px;
  border: 1px solid #e8e8e8;
  & > .ant-card-head {
    text-align: center;
    background-color: #fafafa;
  }
  .ant-card-grid {
    width: 100%;
    padding: 0;
    box-shadow: none;
    &:hover {
      box-shadow: none;
    }
    .ant-table {
      padding: 10px;
    }
  }
  position: relative;
`;

export const TableContainer = styled(Table)`
  border-left: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
  border-top: 1px solid #e8e8e8;
  .ant-table-thead > tr > th {
    background: white;
  }
`;

export const InputGroupContainer = styled(InputGroup)`
  display: flex !important;
  justify-content: center;
  align-items: center;
  & .ant-form-item {
    flex: 0.8;
    margin: 0;
    margin-right: 15px;
    display: flex;
    align-items: center;
  }
`;

export const FormContainer = styled(Form)`
  padding: 20px 0 !important;
  border: 1px solid #e8e8e8;
  border-bottom: none;
`;
