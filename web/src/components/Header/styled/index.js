import styled from 'styled-components';
import { Menu, Layout, Button } from 'antd';

export const LogoContainer = styled.div`
  width: 120px;
  height: 30px;
  // margin: 16px 28px 16px 0;
  float: left;
  justify-content: center;
  align-items: center;
  display: flex;
  color: white;
  font-size: 1.7rem;
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
  height: 50px;
  line-height: 50px;
`;

export const AlignRight = styled.div`
  margin-left: auto;
`;

export const HeaderButton = styled(Button)`
  // background-color: #e8324ab8;
  // background-color: #2c455f;
  margin-left: 8px;
  // background-color: #203d58;
  border: none;

  background: #163146;
`;

export const UserButton = styled(HeaderButton)`
  display: flex;
  align-items: center;
`;

export const TokenContainer = styled.div`
  // background-color: white;
  // border: 1px solid #e8e8e8;
  .ant-table-small {
    border: none;
  }
`;
