import styled from 'styled-components';
import { Card, Table } from 'antd';

export const Colored = styled.span`
  color: ${props => props.color || 'black'};
`;

export const Title = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const CardContainer = styled(Card)`
  width: 400px;
  padding: 0;
  & > .ant-card-head {
    border: 1px solid #e8e8e8;
    margin-bottom: 15px;
    text-align: center;
    background-color: #fafafa;
  }
  .ant-card-grid {
    width: 100%;
    padding: 0;
    box-shadow: none;
    &:hover {
      box-shadow: none;
    }
  }
`;

export const TableContainer = styled(Table)`
  border-left: 1px solid #e8e8e8;
  border-right: 1px solid #e8e8e8;
  border-top: 1px solid #e8e8e8;
`;

export const SmallText = styled.span`
  font-size: 0.7rem;
`;
