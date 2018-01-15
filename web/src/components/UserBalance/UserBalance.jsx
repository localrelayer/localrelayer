// @flow
import React from 'react';
import type { Node } from 'react';
import type { Tokens } from 'instex-core/types';
import { Card, Switch, Icon, Tooltip } from 'antd';
import { CardContainer, TableContainer } from './styled';

type Props = {
  /** Array of Tokens on user balance */
  tokens: Tokens,
  /**
   * Called whenever balance unlocks.
   * Changes tradable option in token object
   * */
  onToggle: Function,
  /**
   * Function that is called whenever balance unlocks
   * */
  onTokenClick: Function,
};

const getColumns = onToggle => [
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (text, record) => <Tooltip title={record.name}>{text}</Tooltip>,
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
  },
  {
    title: 'Tradable',
    key: 'tradable',
    render: (text, record) => (
      <Switch
        checked={record.tradable}
        checkedChildren={<Icon type="check" />}
        onChange={() => onToggle(record)}
      />
    ),
  },
];

/**
 * List of all user tokens with balance and ability to unlock
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const UserBalance = ({ tokens, onToggle, onTokenClick }: Props): Node => (
  <CardContainer bordered={false} title="Your Balances">
    <Card.Grid>
      <TableContainer
        onRow={record => ({
          onClick: () => onTokenClick(record),
        })}
        pagination={false}
        dataSource={tokens}
        columns={getColumns(onToggle)}
      />
    </Card.Grid>
  </CardContainer>
);

UserBalance.defaultProps = {
  onToggle: () => {},
  onTokenClick: () => {},
};

export default UserBalance;
