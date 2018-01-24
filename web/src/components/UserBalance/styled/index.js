import styled from 'styled-components';
import {
  Card,
  Table,
  Input,
} from 'antd';

const InputGroup = Input.Group;

export const Title = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const CardContainer = styled(Card)`
  width: 400px;
  padding: 0;
  & > .ant-card-head {
    border: 1px solid #e8e8e8;
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
  }
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
  padding: 20px 0;
  & .ant-form-item {
    margin: 0;
    margin-right: 13px;
    display: flex;
    align-items: center;
  }
`;

