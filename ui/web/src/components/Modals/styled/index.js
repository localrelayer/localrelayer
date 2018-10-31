import styled from 'styled-components';
import {
  Form,
} from 'antd';
import * as colors from 'web-styles/colors';

export const AlertDescription = styled.div`
  color: ${colors.white};
`;

export const GasForm = styled(Form)`
  & .ant-input {
    background-color: ${colors['background-color-light']};
  }
  .ant-form-item label {
    color: ${colors.white};
  }
`;

export const AlertLink = styled.a`
  color: ${colors['link-color']}
`;
