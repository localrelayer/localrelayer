import styled from 'styled-components';
import {
  Button,
  Form,
  Input,
  Icon,
  Popover,
  Select,
} from 'antd';
import * as colors from 'web-styles/colors';


export const BuySellForm = styled(Form)`
  & .ant-btn-primary {
    color: #fff;
    background-color: ${props => (props.buttonvalue === 'Buy' ? colors.green : colors.red)};
    border-color: ${props => (props.buttonvalue === 'Buy' ? colors.green : colors.red)};
}
  & .ant-btn-primary:hover,
    .ant-btn-primary:focus {
    color: #fff;
    background-color: ${props => (props.buttonvalue === 'Buy' ? '#4FB564' : '#990000')}; 
    border-color: ${props => (props.buttonvalue === 'Buy' ? '#4FB564' : '#990000')};
  }
  .ant-form-item {
    color: ${colors.white};
    margin-bottom: 0;
  }
  & .ant-input {
    background-color: ${colors['background-color-light']};
  }
  & .ant-select-selection {
    background-color: ${colors['background-color-light']};
  }
  .ant-form-item label {
    color: ${colors.white};
  }
  .ant-form-explain {
    font-size: 10px;
  }
  .has-error .ant-select-selection,
  .has-error .ant-select-selection:hover {
    border-color: ${colors['background-color-light']};
  }
  .has-error .ant-select-open .ant-select-selection,
  .has-error .ant-select-focused .ant-select-selection {
    border-color: ${colors['background-color-light']};
    -webkit-box-shadow: 0 0 0 0;
    box-shadow: 0 0 0 0;
  }
  .has-error .ant-select.ant-select-auto-complete .ant-input:focus {
    border-color: ${colors['background-color-light']};
  }
  .has-error .ant-select-arrow {
  color: ${colors.white};
  }
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

export const ExpirationBlock = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

export const ExpirationInput = styled(Input)`

`;

export const ExpirationSelect = styled(Select)`

`;
