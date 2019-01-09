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
    padding: 12px 20px;
  }
  overflow: auto;
`;

export const BuySellTabs = styled(Tabs)`
  .ant-tabs-bar {
    border-bottom: 1px solid ${colors['component-background']};
    margin: 0 0 10px 0 !important;
  } 

  .ant-tabs-nav {
    width: 100%;
  }

  .ant-tabs-tab {
    width: 48%;
    border: none !important;
    border-radius: 4px !important;
    line-height: 32px !important;
  }

  .ant-tabs-tab:hover {
    color: white !important;
  }

  .ant-tabs-tab-active {
    color: white !important; 
    background: ${props => (props.activeKey.includes('Bid') ? '#2794673d' : '#a037563d')} !important;
  }

  .ant-tabs-nav-container {
    height: 32px;
  }

  .ant-tabs-nav-wrap {
    text-align: center;
  }

`;

export const TabsExtraContent = styled.div`
  font-size: 0.85em;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100px;
  display: block;
  overflow: hidden;
  line-height: 28px;
`;

export const MarketLimitTabs = styled(Tabs)`
  .ant-tabs-bar {
    margin: 0 0 20px 0;
  }
`;
