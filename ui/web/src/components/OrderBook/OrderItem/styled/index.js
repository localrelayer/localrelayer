import styled from 'styled-components';

export const Bar = styled.div`
  right: 0;
  position: absolute;
  background: ${props => props.color};
  width: ${props => props.width} !important;
  min-height: 24px;
  opacity: 0.5;
`;

export const AmountBar = styled.div`
  background: ${props => props.color};
  width: ${props => props.width} !important;
  min-height: 24px;
  margin-right: auto;
  opacity: 0.8;
`;

export const OrderItem = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  min-height: 24px;
  position: relative;
  color: white;
  align-items: center;
  &:hover {
     cursor: pointer;
  }
    & div {
      width: 30%;
      text-align: left;
    }
`;
