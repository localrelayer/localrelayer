import styled from 'styled-components';
import {
  Table as AntdTable,
  Button,
} from 'antd';
import * as colors from 'web-styles/colors';

export const UserBalance = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: ${colors['component-background']};
  padding: 5px 24px;
`;

export const Title = styled.div`
  display: flex;
  justify-content: center;
  font-size: 16px;
`;

export const WrappingBar = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: space-between;
  & .ant-input {
    background-color: ${colors['background-color-light']};
  }
`;

export const Amount = styled.div`
  width: 45%;
`;

export const UnwrapWrapBar = styled.div`
  width: 50%;
  & .ant-btn-primary {
    background-color: ${colors['background-color-light']};
    border-color: ${colors['background-color-light']};
    color: ${colors.white};
}
`;

export const UnwrapButton = styled(Button)`
  width: 55%;
`;

export const WrapButton = styled(Button)`
 width: 45%
`;

export const SearchField = styled.div`
 width: 50%;
`;

export const Table = styled(AntdTable)`
 
  .ant-table-thead > tr > th {
    padding: 0 5px 5px 5px;
    background-color: ${colors['component-background']} !important;
    border-bottom: 1px solid ${colors['component-background']} !important;
    color: ${colors.text};
    text-align: left;
  }
  .ant-table-thead > tr > th:nth-child(1) {
    width: ${props => (props.isTradingPage ? '25%' : '20%')};
  }
  .ant-table-thead > tr > th:nth-child(2) {
    width: ${props => (props.isTradingPage ? '50%' : '30%')};
  }
  .ant-table-thead > tr > th:nth-child(3) {
    width: ${props => (props.isTradingPage ? '25%' : '30%')};
  }
  .ant-table-thead > tr > th:nth-child(4) {
    width: 15%;
  }
  .ant-table-thead > tr > th:nth-child(5) {
    width: 5%;
  }
  
  .ant-table-tbody > tr > td {
    border-bottom: 1px solid ${colors['component-background']};
    color: ${colors.text};
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    padding: 5px 5px;
  }
  
  .ant-table-tbody > tr > td:nth-child(1) {
    width: ${props => (props.isTradingPage ? '25%' : '20%')};
  }
  .ant-table-tbody > tr > td:nth-child(2) {
    width: ${props => (props.isTradingPage ? '50%' : '30%')};
  }
  .ant-table-tbody > tr > td:nth-child(3) {
    width: ${props => (props.isTradingPage ? '25%' : '30%')};
  }
  .ant-table-tbody > tr > td:nth-child(4) {
    width: 15%;
  }
  .ant-table-tbody > tr > td:nth-child(5) {
    width: 5%;
  }
  
  .ant-table-tbody > tr > td:last-child {
    text-align: ${props => (props.isTradingPage ? 'right' : 'left')}; 
  }
  .ant-table-thead > tr > th:last-child {
    text-align: ${props => (props.isTradingPage ? 'right' : 'left')}; 
} 

  .ant-table-tbody > tr:hover > td {
    background-color: ${colors['item-hover-bg']} !important;
  }
  
    & .ant-table-placeholder {
    border-color: ${colors['popover-bg']} !important;
  }
`;
