import styled from 'styled-components';
import {
  Card,
  Button,
  Form,
  Tabs,
  Input,
  Icon,
  Popover,
} from 'antd';
import * as colors from 'web-styles/colors.js';

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
`;

export const BuySellForm = styled(Form)`
 & .ant-btn-primary {
  color: #fff;
  background-color: ${colors.green};
  border-color: ${colors.green};
}

& .ant-btn-primary:hover,
.ant-btn-primary:focus {
  color: #fff;
  background-color: #4FB564;
  border-color: #4FB564;
}

  .ant-form-item {
  color: ${colors.white};
}
  & .ant-input {
    background-color: ${colors['background-color-light']};
  }
  .ant-form-item label {
  color: ${colors.white};
}
`;

export const FormInput = styled(Input)`
`;

export const FormItemTitle = styled.div`
  display: flex;
  width: 100%;
`;

export const FormItemTitleLinks = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  & a, a:hover {
  font-size: 0.9em;
  padding-left: 5px;
  text-decoration: underline;
  }
`;

export const SubmitButton = styled(Button)`
  width: 100%;
  margin-top: 10px;
`;

export const AdditionalInfo = styled.div`
  font-size: 0.85em;
  display: flex;
  justify-content: space-between;
  width: 100%;
  color: ${colors.white};
`;

export const AdditionalInfoIcon = styled(Icon)`
  margin: 2px 0 0 2px;
`;

export const AdditionalInfoPopover = styled(Popover)`
  .ant-popover-inner-content {
  color: ${colors.white};
}
`;
