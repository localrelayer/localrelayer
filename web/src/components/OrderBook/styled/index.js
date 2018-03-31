import styled from 'styled-components';
import {
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
  margin: 10px 0 !important;
  // color: rgba(0, 0, 0, 0.65) !important;
`;

export const Table = styled.div`  
  .Table-row:nth-child(2) {
    margin-top: 0;
  }
`;

export const IconContainer = styled.div`
  flex-grow: 0.2;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const AmountFillContainer = styled.div`
  position: absolute;
  height: 100%;
  z-index: 1;
  left: 0;
  top: 0;
  width: ${props => props.width};
  background: ${props => (props.type === 'sell' ? '#ff000040' : '#00800029')};
`;
