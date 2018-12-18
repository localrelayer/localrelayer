import {
  Tabs,
} from 'antd';
import styled from 'styled-components';
import * as colors from 'web-styles/colors';

export const UserOrdersTabs = styled(Tabs)` 
   height: 100%;
  .ant-tabs-content {
    height: 100%;
    background-color: ${colors['component-background']};
  }
  .ant-tabs-tabpane {
    height: 100%;
  } 
  .ant-tabs-bar {
     background-color: ${colors['component-background']};
     margin: 0;
     border-bottom: 1px solid ${colors['component-background']};
  }
  .ant-tabs-tab-active {
    color: white !important;
  }
`;
