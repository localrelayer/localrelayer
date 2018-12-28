import styled from 'styled-components';
import {
  Button,
} from 'antd';
import * as colors from 'web-styles/colors';


export const ErrorBoundary = styled.div`
  display: flex;
  flex-direction: ${props => (props.componentKey === 'assetPairCard' ? 'row' : 'column')};
  justify-content: center;
  align-items: center;
  background-color: black;
  color: ${colors.white};
  width: 100%;
  height: 100%;
`;

export const Header = styled.div`
  font-size: 16px;
`;

export const AdditionalInfo = styled.div`
  font-size: 12px;
  margin-left: 10px;
`;

export const ButtonWrapper = styled.div`
  margin: 10px 0 10px 10px;
`;

export const ReloadButton = styled(Button)`
  
`;
