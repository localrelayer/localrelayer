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
  height: 100%;
  & > .ant-card-head {
    // border: 1px solid #e8e8e8;
    text-align: center;
    // background-color: #fafafa;
  }
  .ant-card-grid {
    width: 100%;
    padding: 0;
    box-shadow: none;
    &:hover {
      box-shadow: none;
    }
  }
`;

export const TableContainer = styled(Table)`
.ant-table-body {
  min-height: 643px;
}
  padding: 0 10px;
  .ant-table-thead > tr > th {
    // background: white;
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
`;

