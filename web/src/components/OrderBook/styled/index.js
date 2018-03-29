import styled from 'styled-components';
import { Tag } from 'antd';

export const OrderBookContainer = styled.div`
  display: flex;
  position: relative;
  &>div:first-child {
    margin-right: 0;
    h3 {
      border-right: none;
    }
    .ant-table {
      border-right: none;
    }
  }

  &>div:nth-child(3) {
    margin-left: 0;
    h3 {
      border-left: none;
    }
    // .ant-table {
    //   border-left: none;
    // }
  }
`;

export const SpreadContainer = styled(Tag)`
  position: absolute;
  top: 23px;
  left: 41%;
`;

