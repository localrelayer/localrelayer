import styled from 'styled-components';
import {
  Avatar,
  Card,
  Icon,
} from 'antd';

export const Title = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const CardContainer = styled(Card)`
  max-width: 400px;

  & .ant-card-actions {
    & li:first-child {
      width: 70% !important;
    }
    & li:last-child {
      width: 30% !important;
    }
  }
`;

export const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const AvatarContainer = styled(Avatar)`
  background: none !important;
`;

export const LastPriceContainer = styled.div`
  font-size: 1.2rem;
`;

export const IconContainer = styled(Icon)`
  font-size: ${props => props.size || '16px'}
`;

export const LinkContainer = styled.a``;

