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
  & > .ant-card-head {
    text-align: center;
  }
  .ant-card-body {
    padding: 0;
  }
  .ant-card-grid {
    width: 100%;
    padding: 0;
    box-shadow: none;
    &:hover {
      box-shadow: none;
    }
    .ant-table {
      padding: 0 10px;
    }
  }
  position: relative;
`;

export const TableContainer = styled(Table)`
  border: none;
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
  padding: 5px 0 !important;
  border-bottom: none;
`;
