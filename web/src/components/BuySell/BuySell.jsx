// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import {
  withState,
} from 'recompose';
import type {
  Token,
} from 'instex-core/types';

import BuySellForm from './BuySellForm';
import { CardContainer } from './styled';

type Props = {
  /** Called on form submit */
  onSubmit: Function,
  /** Called on tab change */
  changeActiveTab: Function,
  /** Active tab */
  activeTab: string,
  /** Token name for placeholder */
  currentToken: Token,
  /** Pair name for placeholder */
  currentPair: Token,
  /** Fill field with presetted value */
  fillField: () => void,
};

const tabList = [
  {
    key: 'buy',
    tab: 'Buy',
  },
  {
    key: 'sell',
    tab: 'Sell',
  },
];

/**
 * Buy/Sell
 * @version 1.0.0
 * @author [Vladimir Pal](https://github.com/VladimirPal)
 */

const enhance = withState('activeTab', 'changeActiveTab', 'buy');

const BuySell: StatelessFunctionalComponent<Props> = ({
  onSubmit,
  changeActiveTab,
  activeTab,
  currentToken,
  currentPair,
  fillField,
}: Props): Node =>
  <CardContainer
    title="Create Order"
    tabList={tabList}
    onTabChange={changeActiveTab}
  >
    <BuySellForm
      fillField={fillField}
      type={activeTab}
      currentToken={currentToken}
      currentPair={currentPair}
      onSubmit={values => onSubmit({ ...values, type: activeTab })}
    />
  </CardContainer>;

export default enhance(BuySell);
