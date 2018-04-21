import styled from 'styled-components';

export const TradingHistoryContainer = styled.div`
  display: flex;
  height: 100%;

  & .ant-table-empty {
    height: 300px;
  }

  .ant-table-small:not(.ant-table-empty) {
    height: 244px;
  }
`;
