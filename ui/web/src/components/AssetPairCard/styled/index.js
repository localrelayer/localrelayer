import styled from 'styled-components';
import {
  Card,
} from 'antd';


export const AssetPairCard = styled(Card)`
  height: 100%;
  margin: 0;

  .ant-card-body {
    padding: 15px;
  }
`;

export const AssetPairInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const CardTitle = styled.div`
  font-size: 1.3em;
  display: flex;
  justify-content: space-between;
`;

export const AssetPrice = styled.div`
  display: flex;
  font-size: 0.8rem;
  align-items: flex-end;
  justify-content: space-between;
`;

export const BaseAssetAddress = styled.a`
  font-size: 0.8rem;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 10px;
`;

export const LastPrice = styled.div`
  font-weight: 400;
  font-size: 1.1rem;
`;

export const PriceChange = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 1rem;
`;
