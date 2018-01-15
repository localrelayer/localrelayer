// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import type { Token } from 'instex-core/types';

import { TokenListContainer, Colored } from './styled';
import OrdersList from '../OrdersList';

type Props = {
  /** List of all orders */
  tokens: Array<Token>,
  /**
   * Function that is called whenever order clicked
   * */
  onClick: Function,
};

const columns = [
  {
    title: 'Coin',
    dataIndex: 'symbol',
    key: 'symbol',
  },
  {
    title: 'Price',
    dataIndex: 'lastPrice',
    key: 'lastPrice',
  },
  {
    title: 'Volume',
    dataIndex: 'tradingVolume',
    key: 'tradingVolume',
    sorter: (a, b) => a.tradingVolume - b.tradingVolume,
  },
  {
    title: 'Change',
    dataIndex: 'change24Hour',
    key: 'change24Hour',
    render: text =>
      (text > 0 ? (
        <Colored color="green">{`+${text}%`}</Colored>
      ) : (
        <Colored color="red">{`${text}%`}</Colored>
      )),
  },
];

/**
 * Tokens list
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const TokensList: StatelessFunctionalComponent<Props> = (props: Props): Node => {
  const { tokens, onClick } = props;
  return (
    <TokenListContainer>
      <OrdersList {...props} columns={columns} data={tokens} onClick={onClick} />
    </TokenListContainer>
  );
};

export default TokensList;
