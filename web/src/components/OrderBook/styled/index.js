import styled from 'styled-components';
import {
  Tag,
  Divider,
} from 'antd';

export const OrderBookContainer = styled.div`
  display: flex;
  height: 97%;
  flex-direction: column;
  position: relative;
  .ant-badge-status-processing {
    &:after {
      border-color: #4CAF50;
    }
    background-color: #4CAF50;
  }
  .ant-table {
    padding: 7px 0;
  }
  & table {
    .ant-table-row > td {
      padding: 2px 5px !important;
    }
    .ant-table-without-column-header {
      padding-top: 5px;
    }
  }
  // &>div:first-child {
  //   margin-right: 0;
  //   h3 {
  //     border-right: none;
  //   }
  //   .ant-table {
  //     border-right: none;
  //   }
  // }

  // &>div:nth-child(3) {
  //   margin-left: 0;
  //   h3 {
  //     border-left: none;
  //   }
    // .ant-table {
    //   border-left: none;
    // }
  }
`;

export const SpreadContainer = styled(Divider)`
  margin: 5px 0 !important;
`;

