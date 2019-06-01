import styled from 'styled-components';
import * as colors from 'web-styles/colors';

export const DottedBorder = styled.div`
  border : 3px dashed gray;
  height : 100%;
  text-align : center;
  font-size: 24px;
  background-color: ${colors['body-background']};
`;

export const TradingPage = styled.div`
  display: flex;
  height: calc(100vh - 54px);
`;

const Column = styled.div`
  height: 100%;
  padding: 0 0 5px 0;
`;

export const Column1 = styled(Column)`
  flex: none;
  width: 370px;
`;

export const Column2 = styled(Column)`
  flex-grow: 1;
  flex-basis: auto;
  min-width: 310px;
`;

export const Column3 = styled(Column)`
  flex-grow: 4;
  flex-basis: auto;
  min-width: 750px;
`;

const Element = styled.div``;

export const BuySellWrapper = styled(Element)`
  height: 450px;
  padding: 10px 5px 5px 10px;
`;
export const UserBalanceWrapper = styled(Element)`
  height: calc(100% - 450px);
  padding: 5px 5px 10px 10px;
`;
export const OrderBookWrapper = styled(Element)`
  height: 100%;
  padding: 10px 5px 10px 5px;
`;
export const AssetPairCardWrapper = styled(Element)`
  height: 60px;
  padding: 10px 10px 0 5px;
`;
export const TradingChartWrapper = styled(Element)`
  height: calc(60% - 60px);
  padding: 10px 10px 5px 5px;
`;
export const UserOpenOrdersWrapper = styled(Element)`
  height: 40%;
  padding: 5px 10px 10px 5px;
`;
