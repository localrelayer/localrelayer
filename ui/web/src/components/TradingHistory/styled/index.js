import styled from 'styled-components';
import {
  Table,
} from 'antd';
import * as colors from 'web-styles/colors';


export const TradingHistoryTable = styled(Table)`
  .ant-table {
   padding-left: ${props => (props.isUserTradingHistory ? '10px' : 0)};
   border: 1px solid ${colors['component-background']} !important;
  }
  
  .ant-table-thead > tr > th {
    background: ${colors['component-background']};
    border-bottom: 1px solid ${colors['component-background']} !important;
    color: white;
    text-align: left;
    width: ${props => (props.isTradingPage ? '30%' : '13%')};
  }
  
  .ant-table-thead > tr > th:last-child {
    width: 10%;
  } 
  
  .ant-table-tbody > tr > td {
    color: white;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    width: ${props => (props.isTradingPage ? '30%' : '13%')};
    padding: 5px 5px;
    border-bottom: 1px solid ${colors['component-background']} !important;
  }

  .ant-table-tbody > tr > td:last-child {
    width: 5%;
  }

  .ant-table-thead > tr > th:last-child {
    width: 5%;
  }
  
  .ant-table-tbody > tr:hover > td {
    background-color: ${colors['item-hover-bg']} !important; 
  }
`;

export const TradingHistory = styled.div`
  height: 100%;
  width: 100%;
  background-color: ${colors['component-background']};
`;

export const Header = styled.div`
  display: flex;
  justify-content: center;
  font-size: 18px;
`;
