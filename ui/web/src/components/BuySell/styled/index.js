import styled from 'styled-components';
import {
  Card,
  Tabs,
} from 'antd';
import * as colors from 'web-styles/colors';

export const BuySell = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

export const BuySellCard = styled(Card)`
  height: 100%;
`;

export const BuySellTabs = styled(Tabs)`
  .ant-tabs-bar {
    border-bottom: 1px solid ${colors['component-background']};
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
