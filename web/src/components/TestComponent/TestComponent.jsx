// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';

import {
  StyledTestComponent,
} from './styled';

export type Props = {
  /** Change the style to indicate the component is selected. */
  isSelected: boolean,
}

/**
 * Button
 * @version 1.0.0
 * @author [Vladimir Pal](https://github.com/VladimirPal)
 */
const TestComponent: StatelessFunctionalComponent<Props> = ({
  isSelected,
}: Props): Node =>
  <StyledTestComponent
    isSelected={isSelected}
  >
    TestComponent
  </StyledTestComponent>;

export default TestComponent;
