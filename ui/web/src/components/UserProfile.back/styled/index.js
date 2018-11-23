import styled from 'styled-components';
import {
  Avatar,
  Select,
} from 'antd';

export const UserProfileContainer = styled.div`
  display: flex;
`;


export const AvatarContainer = styled(Avatar)`
  padding: 5px;
  background: none;

  &>img {
    height: 100%;
    width: 100%;
  }
`;

export const TabName = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const StyledSelect = styled(Select)`
  width: 100%;
  margin-top: 25px
`;
