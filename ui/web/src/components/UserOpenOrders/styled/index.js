import styled from 'styled-components';
import {
  Table,
} from 'antd';
import * as colors from 'web-styles/colors';

export const UserOpenOrders = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  background-color: ${colors['component-background']};
  padding: 5px 24px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: flex-start;
  height: 9%;
  font-size: 18px;
`;

export const SearchField = styled.div`
  & .ant-input {
    background-color: ${colors['background-color-light']};
  }
 width: 35%;
`;

export const Title = styled.div`
  padding-left: 5%;
  width: 65%;
`;

export const UserOpenOrdersTable = styled(Table)`
 
  .ant-table {
    border: none;
  }

  .ant-table-thead > tr > th {
    background-color: ${colors['component-background']} !important;
    border-bottom: 1px solid ${colors['component-background']} !important;
    color: white;
    text-align: left;
    width: 13%;
  }
    .ant-table-tbody > tr.shadowed {
      background-color: #330000 !important;
    }
    .ant-table-tbody > tr.shadowed:hover > td {
      background-color: #330000 !important;
    }
   .ant-table-tbody > tr:hover > td {
      background-color: ${colors['component-background']} !important;
    } 
  
  .ant-table-tbody > tr > td {
    border: none;
    color: white; 
    font-size: 12px;
    text-align: left;
    cursor: pointer;
   width: 13%;
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
