import styled from 'styled-components';

export const OrdersListContainer = styled.div`
  flex: 1;
  height: 100%;
  // min-height: 455px;
  background: white;

  .ant-table-placeholder {
    // min-height: 375px;
  }

  .ant-table {
    font-size: 0.8rem;
    border-radius: 0px;
  }
  .ant-table-small {
    background: white;
    // min-height: 357px;
  }

  .ant-table-tbody > tr > td {
    padding: 6px !important;
  }
`;

export const TableTitle = styled.h3`
  background: #fafafa;
  margin-bottom: 0;
  padding: 10px;
  text-align: center;
  border: 1px solid #e8e8e8;
  border-bottom: none;
`;
