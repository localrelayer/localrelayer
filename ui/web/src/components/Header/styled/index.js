import styled from 'styled-components';
import {
  Icon,
  Popover,
  Button,
  Table,
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
  height: 7%;
`;

export const InstexLogo = styled.img`
  width: 12%;
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

export const TokensButton = styled(Button)`
   .ant-btn-primary {
  color: red !important;
  background-color: red !important;
  border-color: red !important;
}
`;

export const TokensPopover = styled(Popover)`
 .ant-popover-inner {
  background-color: red !important;
}
 .ant-popover-arrow {
  background-color: red !important;
}
`;

export const TokensTable = styled(Table)`
.ant-table {
  border-bottom: 1px solid ${colors['component-background']};
  border-top: 1px solid ${colors['component-background']};
}

.ant-table-thead > tr > th {
  background: ${colors['component-background']};
  border-bottom: 1px solid ${colors['component-background']} !important;
  color: white;
  text-align: left;
  width: 22%;
}

.ant-table-thead > tr > th:nth-child(1) {
  width: 12%;
}

.ant-table-tbody > tr > td {
  color: white;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  width: 22%;
}

.ant-table-tbody > tr > td:nth-child(1) {
  width: 12%;
}

.ant-table-tbody > tr:hover > td {
  background: ${colors['item-hover-bg']};
  }
  .ant-table-tbody > tr > td {
    padding: 5px 5px;
  } 
`;

export const PopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  & .ant-input {
    background-color: ${colors['background-color-light']};
    width: 100%;
  border-radius: 4px 0 0 4px;
  }
  
  & .ant-select {
    background-color: ${colors['background-color-light']};
    width: 30%;
  }
  
  & .ant-select-selection {
    background-color: ${colors['background-color-light']};
  }
  
  & .ant-select-arrow {
    color: white;
  }
`;

export const SearchBar = styled.div`
  display: flex;
`;
