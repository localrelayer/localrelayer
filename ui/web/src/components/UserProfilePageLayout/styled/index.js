import styled from 'styled-components';
import * as colors from 'web-styles/colors';

export const DottedBorder = styled.div`
  border : 3px dashed gray;
  height : 100%;
  text-align : center;
  font-size: 24px;
  background-color: ${colors['body-background']};
`;

export const UserProfilePage = styled.div`
  display: flex;
  height: calc(100vh - 54px);
`;

const Column = styled.div`
  height: 100%;
  padding: 0 0 5px 0;
`;

export const Column1 = styled(Column)`
  flex-grow: 1;
  flex-basis: auto;
  min-width: 550px;
`;

export const Column2 = styled(Column)`
  flex-grow: 1;
  flex-basis: auto;
  min-width: 750px;
`;

const Element = styled.div`
  padding: 5px 5px 0 0;
`;


export const UserBalanceWrapper = styled(Element)`
  height: 100%;
  padding: 10px 5px 10px 10px;
`;

export const TradingHistoryWrapper = styled(Element)`
  height: 60%;
  padding: 10px 10px 5px 5px;
`;

export const UserOpenOrdersWrapper = styled(Element)`
  height: 40%;
  padding: 5px 10px 10px 5px;
`;
