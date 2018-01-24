// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import type { Token } from 'instex-core/types';
import { Card, Avatar } from 'antd';
import {
  Title,
  CardContainer,
  PriceContainer,
} from './styled';
import { Colored } from '../SharedStyles';

const { Meta } = Card;

type Props = {
  /** Token object */
  token: Token,
  /** Token trading pair */
  tokenPair: Token,
  /**
   * Function that is called whenever button clicked
   * */
  onClick: Function,
};

/**
 * Token Card
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TokenCard: StatelessFunctionalComponent<Props> = ({
  token: {
    trading = {},
    symbol,
  },
  tokenPair,
  onClick,
}: Props): Node => {
  const {
    volume,
    change24Hour,
    lastPrice,
    highPrice,
    lowPrice,
  } = trading[tokenPair.symbol] || {};
  const isPositive = +change24Hour >= 0;

  return (
    <CardContainer
      actions={[
        <div>Volume: {volume || 0} {tokenPair.symbol}</div>,
        <div id="watch-btn" onClick={onClick}>
          {isPositive ?
            <Colored color="green">{`+${change24Hour || 0.00}%`}</Colored>
           :
            <Colored color="red">{`${change24Hour || 0.00}%`}</Colored>
          }
        </div>,
    ]}
    >
      <Meta
        avatar={
          <Avatar src="https://davidgerard.co.uk/blockchain/wp-content/uploads/2017/10/ebtc-300x300.jpg" />
      }
        title={getTitle(symbol, tokenPair.symbol, change24Hour, lastPrice)}
        description={
          <PriceContainer>
            <div>High: {highPrice || '--'}</div>
            <div>Low: {lowPrice || '--'}</div>
          </PriceContainer>
      }
      />
    </CardContainer>);
};

export default TokenCard;

const getTitle = (symbol, tokenPairSymbol, change24Hour, lastPrice) => (
  <Title>
    <div>
      {symbol} / {tokenPairSymbol}{' '}
    </div>
    <div id="last-price">{lastPrice || 'No trades'}</div>
  </Title>
);
