import styled from 'styled-components';

export const Colored = styled.span`
  color: ${props => props.color || 'black'};
`;

export const Truncate = styled.div`
  white-space: nowrap;
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Overlay = styled.div`
  display: ${props => (props.isShown ? 'flex' : 'none')};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background: #eee;
  opacity: 0.8;
  text-align: center;
  transition: opacity .5s;
`;

