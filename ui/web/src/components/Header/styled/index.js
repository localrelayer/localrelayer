import styled from 'styled-components';
import {
  Icon,
  Table,
  Badge,
} from 'antd';
import * as colors from 'web-styles/colors';

export const HeaderIcon = styled(Icon)`
  padding-right: 10px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  background-color: ${colors['layout-header-background']};
  height: 54px;
`;

export const InstexLogo = styled.img`
  height: 100%;
  cursor: pointer;
`;

export const Trade = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8%;
  height: 100%;
  cursor: pointer;
`;

export const Account = styled.div`
  display: flex;
  width: 10%;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
`;

export const TokensTable = styled(Table)`

  .ant-table {
    margin-top: 10px;
    width: 400px;
    border: 1px solid ${colors['component-background']};
  }
  
  .ant-table-thead > tr > th {
    background-color: ${colors['popover-bg']} !important;
    border: 1px solid ${colors['component-background']} !important;
    color: ${colors.text};
    text-align: left;
    width: 33%;
  }
  
  .ant-table-tbody > tr > td {
    padding: 0;
    background-color: ${colors['popover-bg']} !important;
    color: white;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    width: 33%;
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

export const PopoverContent = styled.div`
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

export const NotificationContainer = styled.div`
  margin-left: auto;
  margin-right: 3%;
  display: flex;
`;

export const CurrentNetwork = styled.div`
  .ant-tag {
    background-color: ${props => (props.isSupported ? colors['background-color-light'] : 'red')};
    border-color: ${colors['background-color-light']} !important;
    min-height: 32px;
    min-width: 200px;
    line-height: 32px;
    font-size: 16px;
    color: ${colors.white};
  }
`;

export const TransactionsIcon = styled(Icon).attrs({
  type: 'notification',
})`
  cursor: pointer;
  font-size: 24px;
`;

export const WarningIcon = styled(Icon).attrs({
  type: 'warning',
})`
  margin-right: 20px;
  color: red;
  cursor: pointer;
  font-size: 24px;
`;

export const TransactionsBadge = styled(Badge)`
  .ant-badge-count {
    padding: 0;
    height: 12px;
    font-size: 8px;
    width: 10px;
    line-height: 12px;
    top: -5px;
}
`;

export const UserProfile = styled.div`
  margin-right: 30px;
`;
