// @flow
import React from 'react';

import type {
  Node,
} from 'react';
import type {
  Token,
} from 'instex-core/types';
import {
  Card,
} from 'antd';
import {
  Title,
  CardContainer,
  PriceContainer,
  LastPriceContainer,
  ChangeContainer,
  AddressContainer,
  TokenInfo,
} from './styled';
import {
  Colored,
} from '../SharedStyles';

const {
  Meta,
} = Card;

const getTitle = (symbol, tokenPairSymbol, change24Hour, lastPrice, id) => (
  <Title>
    <TokenInfo>
      <span>
        {symbol} / {tokenPairSymbol}
      </span>
      <AddressContainer target="_blank" rel="noopener" href={`https://etherscan.io/token/${id}`}>
        {id}
      </AddressContainer>
    </TokenInfo>
    <LastPriceContainer>
      <span>{lastPrice || 'No trades in 24hr'}</span>
    </LastPriceContainer>
  </Title>
);

// eslint-disable-next-line
const getImageSrc = symbol => import(`../../assets/images/${symbol}.png`);

type Props = {
  /** Token object */
  token: Token,
  /** Token trading pair */
  tokenPair: Token,
  /**
   * Function that is called whenever button clicked
   * */
  onClick: ?Function,
};

/**
 * Token Card
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TokenCard = ({
  token: {
    tradingInfo,
    symbol,
    id,
  },
  tokenPair,
}: Props): Node => {
  const {
    volume,
    change24Hour,
    lastPrice,
    highPrice,
    lowPrice,
  } = tradingInfo || {};
  const isPositive = +change24Hour >= 0;
  return (
    <CardContainer bordered={false}>
      <Meta
        // avatar={<AvatarContainer shape="square" src={url} />}
        title={getTitle(symbol, tokenPair.symbol, change24Hour, lastPrice, id)}
        description={
          <PriceContainer>
            <div>
              <div>High: {highPrice || '--'}</div>
              <div>Low: {lowPrice || '--'}</div>

            </div>
            <div>
              <ChangeContainer>
                {isPositive ?
                  <Colored className="green">{`+${change24Hour || '0.00'}%`}</Colored>
                :
                  <Colored className="red">{`${change24Hour || '0.00'}%`}</Colored>
                }
              </ChangeContainer>
              <div>Volume: {volume ? Number(volume).toFixed(4) : 0}</div>
            </div>
          </PriceContainer>
      }
      />
    </CardContainer>);
};


TokenCard.defaultProps = {
  onClick: () => {},
};

export default TokenCard;
