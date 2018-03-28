import styled from 'styled-components';

export const OrderBookContainer = styled.div`
  display: flex;

  &>div:first-child {
    margin-right: 0;
    h3 {
      border-right: none;
    }
    .ant-table {
      border-right: none;
    }
  }

  &>div:nth-child(2) {
    margin-left: 0; 
    h3 {
      border-left: none;
    }
    .ant-table {
      border-left: none;
    }
  }
`;
