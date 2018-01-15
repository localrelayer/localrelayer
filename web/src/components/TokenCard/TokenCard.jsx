// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import type { Token } from 'instex-core/types';
import { Card, Avatar } from 'antd';
import { Title, CardContainer } from './styled';
import { Colored } from '../SharedStyles';

const { Meta } = Card;

type Props = {
  /** Token object */
  token: Token,
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
    change24Hour, lastPrice, tradingVolume, symbol, tradingPair, lowPrice, highPrice,
  },
  onClick,
}: Props): Node => (
  <CardContainer
    actions={[
      <div>
        Volume: {tradingVolume} {tradingPair}
      </div>,
      <div id="watch-btn" onClick={onClick}>
        Add to watch list
      </div>,
    ]}
  >
    <Meta
      avatar={
        <Avatar src="https://davidgerard.co.uk/blockchain/wp-content/uploads/2017/10/ebtc-300x300.jpg" />
      }
      title={getTitle(symbol, tradingPair, change24Hour, lastPrice)}
      description={
        <div>
          <div>High: {highPrice}</div>
          <div>Low: {lowPrice}</div>
        </div>
      }
    />
  </CardContainer>
);

export default TokenCard;

const getTitle = (symbol, tradingPair, change24Hour, lastPrice) => {
  const isPositive = change24Hour >= 0;
  return (
    <Title>
      <div>
        {symbol} / {tradingPair}{' '}
        {isPositive ? (
          <Colored color="green">{`(+${change24Hour}%)`}</Colored>
        ) : (
          <Colored color="red">{`(${change24Hour}%)`}</Colored>
        )}
      </div>
      <div>{lastPrice}</div>
    </Title>
  );
};
