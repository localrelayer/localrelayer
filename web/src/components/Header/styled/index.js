import styled from 'styled-components';
import { Menu, Layout, Button } from 'antd';

export const LogoContainer = styled.div`
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
`;

export const MenuContainer = styled(Menu)`
  margin-left: 20px;
  & > .ant-menu-item-selected {
    background: none !important;
  }
`;

export const HeaderContainer = styled(Layout.Header)`
  display: flex;
  align-items: center;
`;

export const AlignRight = styled.div`
  margin-left: auto;
`;

export const HeaderButton = styled(Button)`
  margin-left: 8px;
  background-color: #203d58;
  border: none;
`;

export const Truncate = styled.div`
  white-space: nowrap;
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserButton = styled(HeaderButton)`
  display: flex;
  align-items: center;
`;

export const TokenContainer = styled.div`
  background-color: white;
  border: 1px solid #e8e8e8;
  .ant-table-small {
    border: none;
  }
`;
