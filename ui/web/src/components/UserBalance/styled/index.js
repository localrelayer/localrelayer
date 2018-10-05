import styled from 'styled-components';
import {
  Table as AntdTable,
} from 'antd';
import * as colors from 'web-styles/colors';


export const Title = styled.div`
  margin-bottom: 0;
  padding: 10px;
  text-align: center;
  border-bottom: none;
`;

export const Table = styled(AntdTable).attrs({
  pagination: false,
})`
  border: none;

  .ant-table-thead > tr > th {
    background: ${colors['component-background']};
    border-bottom: 1px solid ${colors['component-background']} !important;
    color: white;
    text-align: left;
    width: 16%;
  }

  .ant-table-tbody > tr:hover > td {
    background: ${colors['item-hover-bg']};
  }
    
`;
