import styled from 'styled-components';


export const OrderItem = styled.div`
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  min-height: 24px;
  &:hover {
     cursor: pointer;
  }
    & div {
    width: 30%;
    text-align: left;
    }
`;
