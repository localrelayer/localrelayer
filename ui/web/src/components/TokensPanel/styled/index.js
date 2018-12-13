import styled from 'styled-components';
import {
  Table,
  Drawer,
} from 'antd';
import * as colors from 'web-styles/colors';

export const TokensDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 10px;
  }
  .ant-drawer-header {
    padding: 10px 0 0 10px;
  }

  .ant-drawer-wrapper-body {
    background: ${colors['popover-bg']};
  }
`;

export const TokensTable = styled(Table)`
  .ant-table {
    margin-top: 10px;
    padding: 0;
  }
  
  .ant-table-thead > tr > th {
    padding-left: 5px;
    background-color: ${colors['popover-bg']} !important;
    color: ${colors.text};
    text-align: left;
    width: 25%;
  }
  
  .ant-table-tbody > tr > td {
    padding-left: 5px;
    background-color: ${colors['popover-bg']} !important;
    color: white;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    width: 25%;
  }

  .ant-table-tbody > tr:hover > td {
    background: ${colors['item-hover-bg']};
  }
  
  .ant-table-tbody > tr > td {
    padding: 5px 5px;
  } 
  
  & .ant-table-placeholder {
    background-color: ${colors['popover-bg']} !important;
  }
`;

export const DrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  & .ant-input {
    background-color: ${colors['background-color-light']};
    width: 70%;
    border-radius: 4px 0 0 4px;
  }
`;

export const SearchBar = styled.div`
  display: flex;
`;
