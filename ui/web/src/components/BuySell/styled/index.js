import styled from 'styled-components';
import {
  Card,
  Tabs,
} from 'antd';
import * as colors from 'web-styles/colors';

export const BuySell = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export const BuySellCard = styled(Card)`
  height: 100%;
  .ant-card-body {
    // To make card smaller
    // padding: 0 20px;
  }
  .ant-form-vertical .ant-form-item {
    // margin-bottom: 10px;
  }
`;

export const BuySellTabs = styled(Tabs)`
  .ant-tabs-bar {
    border-bottom: 1px solid ${colors['component-background']};
  } 
  .ant-tabs-tab-active {
    color: white !important;
  }
`;

export const TabsExtraContent = styled.div`
  font-size: 0.85em;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100px;
  display: block;
  overflow: hidden;
`;
