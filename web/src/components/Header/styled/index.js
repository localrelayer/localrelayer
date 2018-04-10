import styled from 'styled-components';
import { Layout, Button } from 'antd';

export const LogoContainer = styled.div`
  width: 120px;
  height: 30px;
  float: left;
  justify-content: center;
  align-items: center;
  display: flex;
  color: white;
  font-size: 1.7rem;
`;

export const LinksContainer = styled.div`
  & a{
    color: rgba(255, 255, 255, 0.65);
    margin: 0 10px;
  }
  & a:focus {
    text-decoration: none;
  }
  & .anticon {
    margin-right: 10px;
  }
  margin: 0 10px;
`;

export const HeaderContainer = styled(Layout.Header)`
  display: flex;
  align-items: center;
  height: 50px;
  line-height: 50px;

  img {
    height: 50px;
  }
`;

export const AlignRight = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
`;

export const HeaderButton = styled(Button)`
  margin-left: 8px;
  border: none;
  background: #163146;
`;

export const UserButton = styled(HeaderButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 190px;
  margin: 10px;
`;

export const TokenContainer = styled.div`
  // background-color: white;
  // border: 1px solid #e8e8e8;
  .ant-table-small {
    border: none;
  }
`;

export const HelpButton = styled.a`
  margin: 0 10px;
  color: white;
  text-decoration: underline;
`;

export const HelpContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  a {
    text-align: center;
    padding: 10px;
  }
  & img {
    max-height: 80px;
    margin: 0 10px;
  }
`;

