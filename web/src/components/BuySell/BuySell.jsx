// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';

import BuySellForm from './BuySellForm';
import { CardContainer } from './styled';

type Props = {};

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

const BuySell: StatelessFunctionalComponent<Props> = (): Node =>
  <CardContainer
    title="Create Order"
    tabList={tabList}
  >
    <BuySellForm />
  </CardContainer>;

export default BuySell;
