// @flow
import React from 'react';

import type {
  Node,
} from 'react';
import type {
  Token,
} from 'instex-core/types';
import {
  lifecycle,
} from 'recompose';
import {
  Card,
} from 'antd';
import {
  Title,
  CardContainer,
  PriceContainer,
  AvatarContainer,
  LastPriceContainer,
  IconContainer,
  LinkContainer,
} from './styled';
import {
  Colored,
} from '../SharedStyles';

const {
  Meta,
} = Card;

const getTitle = (symbol, tokenPairSymbol, change24Hour, lastPrice) => (
  <Title>
    <div>
      {symbol} / {tokenPairSymbol}{' '}
    </div>
    <LastPriceContainer>
      <Colored color={+change24Hour >= 0 ? 'green' : 'red'}>
        {change24Hour && <IconContainer type={+change24Hour >= 0 ? 'caret-up' : 'caret-down'} />}
      </Colored>
      {' '}
      <span>{lastPrice || 'No trades'}</span>
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
  /** Link to token image */
  url: string,
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
  onClick,
  url,
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
    <CardContainer
      actions={[
        <div>Volume: {volume || 0} {symbol}</div>,
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
        avatar={<AvatarContainer src={url} />}
        title={getTitle(symbol, tokenPair.symbol, change24Hour, lastPrice)}
        description={
          <PriceContainer>
            <div>
              <div>High: {highPrice || '--'}</div>
              <div>Low: {lowPrice || '--'}</div>
            </div>
            <div>
              <LinkContainer target="_blank" rel="noopener" href={`https://etherscan.io/token/${id}`}>
                <IconContainer size="1.2rem" type="share-alt" />
              </LinkContainer>
            </div>
          </PriceContainer>
      }
      />
    </CardContainer>);
};


TokenCard.defaultProps = {
  onClick: () => {},
};

export default lifecycle({
  componentWillReceiveProps(nextProps) {
    const prevSymbol = this.props.token.symbol;
    const nextSymbol = nextProps.token.symbol;
    if (nextSymbol !== prevSymbol) {
      getImageSrc(nextSymbol).then((url) => {
        this.setState({ url });
      }).catch(async () => {
        const defaultUrl = await getImageSrc('default');
        this.setState({ url: defaultUrl });
      });
    }
  },
})(TokenCard);
