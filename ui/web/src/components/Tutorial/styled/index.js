import styled from 'styled-components';
import * as colors from 'web-styles/colors';

import {
  Button,
  Badge,
  Tag,
} from 'antd';

export const Container = styled.div`
  display: flex;
`;

export const Navigation = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid black;
`;

export const NavTitle = styled.h1`
  font-size: 1rem;
`;

export const NavBlock = styled.div`
  padding: 20px;
`;

export const NavText = styled.p`
  font-size: 0.8rem;
`;

export const Content = styled.div`
  display: flex;
  flex: 2;
  justify-content: center;
`;

export const Title = styled.h1`
  font-size: 1rem;
`;

export const Text = styled.div`
  margin: 15px;
  text-align: center;
`;

export const SmallText = styled(Text)`
  font-size: 0.7rem;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;

  .ant-table-tbody > tr:hover > td {
    background-color: ${colors['item-hover-bg']} !important;
  }
  
    & .ant-table-placeholder {
    border-color: ${colors['popover-bg']} !important;
  }
`;

export const StepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
`;

export const NetworkName = styled(Badge)`
  .ant-badge-status-text {
    font-size: 0.7rem;
  }
`;

export const NextButton = styled(Button).attrs({
  type: 'primary',
})`
  position: absolute !important;
  bottom: 50px;
`;

export const TutorialImage = styled.img`
  width: 70%;
`;

export const UserAddress = styled(Tag)`
margin-top: 20px !important;
font-size: 1rem;
min-height: 32px !important;
line-height: 32px !important;
`;
