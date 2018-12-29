import styled from 'styled-components';
import * as colors from 'web-styles/colors';
import {
  Button,
} from 'antd';

export const Bar = styled.div`
  right: 0;
  position: absolute;
  background: ${props => props.color};
  width: ${props => props.width} !important;
  min-height: 24px;
  opacity: 0.3;
`;

export const AmountBar = styled.div`
  background: ${props => props.color};
  width: ${props => props.width} !important;
  min-height: 24px;
  margin-right: auto;
  opacity: 0.8;
`;

export const OrderItem = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  min-height: 24px;
  position: relative;
  color: white;
  align-items: center;
  &:hover {
     cursor: pointer;
  }
  & div {
    z-index: 1;
    width: 30%;
    text-align: left;
  }
`;

export const PopoverHeader = styled.div`
  color: ${props => (props.actionType === 'bids' ? colors.green : colors.red)};
`;

export const PopoverColoredSpan = styled.span`
  color: ${props => (props.actionType === 'bids' ? colors.red : colors.green)};
`;

export const ClickToAction = styled.div`
  font-size: 12px;
`;

export const FillButton = styled(Button).attrs({
  type: 'primary',
  block: true,
})`
  margin-top: 20px;
`;
