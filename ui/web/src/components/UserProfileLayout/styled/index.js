import styled from 'styled-components';
import * as colors from 'web-styles/colors';

export const DottedBorder = styled.div`
  border : 3px dashed gray;
  height : 100%;
  text-align : center;
  font-size: 24px;
  background-color: ${colors['body-background']};
`;
