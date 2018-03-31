import styled from 'styled-components';
import {
  Table,
} from 'antd';

export const TokenListContainer = styled.div`
  display: flex;
  flex-direction: column;

  .ant-table-body {
    background: #00132f;
  }
`;

export const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  align-items: center;
  & .ant-input {
    flex: 1;
    margin-right: 10px;
  }
`;

export const TableContainer = styled(Table)`
  &:hover {
    cursor: pointer;
  }
`;

