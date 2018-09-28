import styled from 'styled-components';
import * as colors from 'web-styles/colors';


export const OrderItem = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  min-height: 24px;
  &:hover {
    cursor: pointer;
    background: ${colors['item-hover-bg']}; 
  }
    & div {
    width: 30%;
    text-align: left  ;
    }
`;
