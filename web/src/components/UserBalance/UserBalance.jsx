// @flow
import React from 'react';
import type { Node } from 'react';
import type { Tokens } from 'instex-core/types';
import { Card, Switch, Icon, Tooltip, Popover } from 'antd';
import { Element } from 'react-scroll';
import WrapForm from './WrapForm';
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
   * Function that is called whenever token is clicked on
   * */
  onTokenClick: Function,
  /** Eth balance */
  balance: string,
  /** Function that is called by wrap button */
  wrap: () => void,
  /** Function that is called by unwrap button */
  unwrap: () => void,
};

const getColumns = onToggle => [
  {
    title: 'Token',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (text, record, i) =>
      <div>
        <Tooltip title={record.name}>{text}</Tooltip> {' '}
        {i === 0 &&
          <Popover placement="right" title={<div>Wrapping ETH allows you to trade directly with alt tokens</div>}>
            <Icon type="question-circle-o" />
          </Popover>
        }
      </div>,
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    render: text => <div>{text}</div>,
  },
  {
    title: 'Tradable',
    key: 'tradable',
    render: (text, record) => (
      <Switch
        checked={record.isTradable}
        checkedChildren={<Icon type="check" />}
        onChange={checked => checked && onToggle(record)}
      />
    ),
  },
];

/**
 * List of all user tokens with balance and ability to unlock
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const UserBalance = ({
  tokens,
  onToggle,
  onTokenClick,
  balance,
  wrap,
  unwrap,
}: Props): Node => (
  <Element name="userBalance">
    <CardContainer
      id="user-balance"
      bordered={false}
      title={<div>My Balance ({balance} ETH)</div>}
    >
      <WrapForm
        wrap={wrap}
        unwrap={unwrap}
        onSubmit={() => {}}
      />
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
  </Element>
);

UserBalance.defaultProps = {
  onToggle: () => {},
  onTokenClick: () => {},
  wrap: () => {},
  unwrap: () => {},
};

export default UserBalance;
