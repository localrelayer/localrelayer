import {
  Tabs as AntdTabs,
} from 'antd';
import styled from 'styled-components';
import * as colors from 'web-styles/colors';

export const TabPane = styled(AntdTabs.TabPane)`
  height: 100%;
`;
export const Tabs = styled(AntdTabs)`
  height: 100%;
  background: ${colors['component-background']};
  .ant-tabs-content {
    height: 100%;
  }
`;
