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
  Icon,
} from 'antd';

import BuySellForm from './BuySellForm';
import {
  CardContainer,
  ExtraContentContainer,
} from './styled';
import {
  Overlay,
} from '../SharedStyles';

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
  /** My balance */
  balance: string,
};

const getExtraContent = (type, currentToken, currentPair) => {
  if (currentPair.symbol && currentToken.symbol) {
    return type === 'sell' ?
      `${currentToken.symbol} ${Number(currentToken.balance)}`
      :
      `${currentPair.symbol} ${Number(currentPair.balance)} `;
  }
  return '';
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
  balance,
  shouldAnimate,
}: Props): Node =>
  <div id="orderForm">
    <CardContainer bordered={false}>
      <Overlay isShown={!isConnected}>
        <h3 style={{
        margin: '20px',
        marginTop: '100px',
      }}
        >
      You are viewing this in read-only mode. Connect a wallet to create order
        </h3>
      </Overlay>
      <Tabs
        animated={false}
        onChange={changeActiveTab}
        activeKey={activeTab}
        tabBarExtraContent={<ExtraContentContainer><Icon type="wallet" />{' '}{getExtraContent(activeTab, currentToken, currentPair)}</ExtraContentContainer>}
      >
        <TabPane tab="Buy" key="buy">
          <BuySellForm
            fillField={fillField}
            type={activeTab}
            currentToken={currentToken}
            currentPair={currentPair}
            onSubmit={onSubmit}
            balance={balance}
            shouldAnimate={shouldAnimate}
          />
        </TabPane>
        <TabPane tab="Sell" key="sell">
          <BuySellForm
            fillField={fillField}
            type={activeTab}
            currentToken={currentToken}
            currentPair={currentPair}
            onSubmit={onSubmit}
            balance={balance}
            shouldAnimate={shouldAnimate}
          />
        </TabPane>
      </Tabs>
    </CardContainer>
  </div>;

export default BuySell;
