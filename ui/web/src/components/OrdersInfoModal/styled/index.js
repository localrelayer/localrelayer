import {
  Collapse,
  Modal,
} from 'antd';
import styled from 'styled-components';
import * as colors from 'web-styles/colors';

export const OrdersInfoModal = styled(Modal)`
  .ant-modal-content {
    height: 570px;
    background-color: ${colors['popover-bg']} !important;
    color: ${colors.white} !important;
  }
  .ant-modal-header {
    text-align: center;
    background-color: ${colors['popover-bg']} !important;
    border-bottom: 1px solid ${colors['popover-bg']} !important;
  }
  .ant-modal-title {
    color: ${colors.white} !important;
  }
  .ant-modal-footer {
    border-top: 1px solid ${colors['popover-bg']} !important;
  }
  .ant-modal-close {
    color: ${colors.white} !important;
  }
  .ant-modal-body {
    height: 440px;
    overflow: scroll;
    padding: 10px;
    background-color: ${colors['popover-bg']} !important;
    border: 1px solid ${colors['popover-bg']} !important;
  }
`;

export const OrdersList = styled(Collapse)`
  border: 1px solid ${colors['popover-bg']} !important;
  .ant-collapse {
    color: ${colors.white} !important;
  }
  .ant-collapse-item {
    border: 1px solid ${colors['popover-bg']} !important;
    background-color: ${colors['popover-bg']} !important;
    color: ${colors.white} !important;
  }
  .ant-collapse-content {
    background-color: ${colors['popover-bg']} !important;
    border: 1px solid ${colors['popover-bg']} !important;
    color: ${colors.white} !important;
  }
  .ant-collapse-header {
    color: ${colors.white} !important;
    background-color: ${colors['popover-bg']} !important;
  }
  .ant-collapse-content > .ant-collapse-content-box {
    padding: 5px;
  }
`;

export const OrderInfo = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
  border: 1px solid ${colors['component-background']};
`;

export const OrderInfoKeys = styled.div`
  width: 25%;
  & div {
    border: 1px solid ${colors['border-color-base']};
    padding: 5px 5px 5px 10px;
  }
`;

export const OrderInfoValues = styled.div`
  width: 75%;
  & div {
    border: 1px solid ${colors['border-color-base']};
    padding: 5px 5px 5px 10px;  
  }
  & div:nth-child(2) {
    color: ${props => props.priceColor};
  }
`;
