import styled, { keyframes } from 'styled-components';
import { pulse } from 'react-animations';

const bounceAnimation = keyframes`${pulse}`;

export const StyleContainer = styled.div`
  animation: ${props => props.animate ? `0.5s ${bounceAnimation}` : 'none'};
`;
