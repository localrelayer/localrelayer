// @flow
import React from 'react';

import type {
  Node,
  StatelessFunctionalComponent,
} from 'react';
import type {
  Token,
} from 'instex-core/types';
import {
  Tabs,
  Card,
} from 'antd';

import BuySellForm from './BuySellForm';
import { CardContainer } from './styled';
import { Overlay } from '../SharedStyles';

const { TabPane } = Tabs;

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
  fillField: Function,
  /** Is user connected to ethereum */
  isConnected: boolean,
};

/**
 * Buy/Sell
 * @version 1.0.0
 * @author [Vladimir Pal](https://github.com/VladimirPal)
 */

const BuySell: StatelessFunctionalComponent<Props> = ({
  onSubmit,
  changeActiveTab,
  activeTab,
  currentToken,
  currentPair,
  fillField,
  isConnected,
}: Props): Node =>
  <CardContainer id="orderForm">
    <Overlay isShown={!isConnected}>
      <h3 style={{
        margin: '20px',
        marginTop: '100px',
      }}
      >
      You are viewing this in read-only mode. Connect a wallet to create order
      </h3>
    </Overlay>
    <Card.Meta title="Create Order" />
    <Tabs
      type="card"
      onChange={changeActiveTab}
      activeKey={activeTab}
    >
      <TabPane tab="Buy" key="buy">
        <BuySellForm
          fillField={fillField}
          type={activeTab}
          currentToken={currentToken}
          currentPair={currentPair}
          onSubmit={values => onSubmit({ ...values, type: activeTab })}
        />
      </TabPane>
      <TabPane tab="Sell" key="sell">
        <BuySellForm
          fillField={fillField}
          type={activeTab}
          currentToken={currentToken}
          currentPair={currentPair}
          onSubmit={values => onSubmit({ ...values, type: activeTab })}
        />
      </TabPane>
    </Tabs>
  </CardContainer>;

export default BuySell;
