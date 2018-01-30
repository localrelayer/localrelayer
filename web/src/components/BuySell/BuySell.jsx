// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import {
  withState,
} from 'recompose';

import BuySellForm from './BuySellForm';
import { CardContainer } from './styled';

type Props = {
  /** Called on form submit */
  onSubmit: Function,
  /** Called on tab change */
  changeActiveTab: Function,
  /** Active tab */
  activeTab: string
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
}: Props): Node =>
  <CardContainer
    title="Create Order"
    tabList={tabList}
    onTabChange={changeActiveTab}
  >
    <BuySellForm
      onSubmit={values => onSubmit({ ...values, type: activeTab })}
    />
  </CardContainer>;

export default enhance(BuySell);
