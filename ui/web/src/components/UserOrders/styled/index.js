import styled from 'styled-components';
import {
  Table,
} from 'antd';
import * as colors from 'web-styles/colors';

export const UserOrders = styled.div`
  display: absolute;
  height: 100%;
  width: 100%;
  background-color: ${colors['component-background']};
`;

export const Title = styled.div`
  display: flex;
  justify-content: center;
  height: 10%;
  font-size: 20px;
`;

export const UserOrdersTable = styled(Table)`
   height: 90%;
  .ant-table {
    border: none;
  }

  .ant-table-thead > tr > th {
    background: ${colors['component-background']};
    border-bottom: 1px solid ${colors['component-background']} !important;
    color: white;
    text-align: left;
    width: 16%;
  }
  
  .ant-table-thead > tr > th:nth-last-child(2) {
    width: 10%;
  }

  .ant-table-tbody > tr > td {
    border: none;
    color: white;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    width: 16%;
  }
  
  .ant-table-tbody > tr > td:nth-last-child(2) {
    width: 10%;
  }

  .ant-table-tbody > tr > td:nth-child(3) {
    color: ${colors.green};
  }

  .ant-table-tbody > tr:hover > td {
    background: ${colors['item-hover-bg']};
    }
    
  .ant-table-tbody > tr > td {
    padding: 5px 5px;
  } 
`;
