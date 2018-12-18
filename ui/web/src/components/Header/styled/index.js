import styled from 'styled-components';
import {
  Icon,
  Badge,
} from 'antd';
import * as colors from 'web-styles/colors';

export const HeaderIcon = styled(Icon)`
  padding-right: 10px;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  background-color: ${colors['layout-header-background']};
  height: 54px;
`;

export const InstexLogo = styled.img`
  height: 100%;
  cursor: pointer;
`;

export const Trade = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8%;
  height: 100%;
  cursor: pointer;
`;

export const Account = styled.div`
  display: flex;
  width: 10%;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
`;

export const NotificationContainer = styled.div`
  margin-left: auto;
  margin-right: 3%;
  display: flex;
`;

export const CurrentNetwork = styled.div`
  .ant-tag {
    background-color: ${colors['background-color-light']};
    border-color: ${colors['background-color-light']} !important;
    min-height: 32px;
    min-width: 200px;
    line-height: 32px;
    font-size: 16px;
    color: ${colors.white};
  }
`;

export const TransactionsIcon = styled(Icon).attrs({
  type: 'notification',
})`
  cursor: pointer;
  font-size: 24px;
`;

export const WarningIcon = styled(Icon).attrs({
  type: 'warning',
})`
  margin-right: 10px;
  padding-top: 5px;
  color: red;
  cursor: pointer;
  font-size: 24px;
`;

export const TransactionsBadge = styled(Badge)`
  .ant-badge-count {
    padding: 0;
    height: 12px;
    font-size: 8px;
    width: 10px;
    line-height: 12px;
    top: -5px;
}
`;

export const UserProfile = styled.div`
  margin-right: 30px;
  .ant-tag {
    border-color: ${colors['background-color-light']} !important;
    min-height: 32px;
    min-width: 200px;
    line-height: 32px;
    font-size: 0.8rem;
    color: ${colors.white};
  }
`;
