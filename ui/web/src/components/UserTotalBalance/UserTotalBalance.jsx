// @flow
import React from 'react';
import type { Node } from 'react';
import type { Tokens } from 'instex-core/types';
import { Card, Switch, Icon, Popover } from 'antd';
import WrapForm from '../UserBalance/WrapForm';
import { CardContainer, TableContainer } from './styled';
import {
  ComponentTitle,
  Overlay,
} from '../SharedStyles';

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
  /** Is something loading */
  isBalanceLoading: boolean,
  /** Is user connected to ethereum */
  isConnected: boolean,
};

const getColumns = onToggle => [
  {
    title: 'Symbol',
    dataIndex: 'symbol',
    key: 'symbol',
    render: (text, record) => (
      <div>
        {text}{' '}
        {record.symbol === 'WETH' && (
          <Popover
            placement="right"
            title={<div>Wrapping ETH allows you to trade directly with alt tokens</div>}
          >
            <Icon type="question-circle-o" />
          </Popover>
        )}
      </div>
    ),
  },
  {
    title: 'Token',
    dataIndex: 'name',
    key: 'name',
    render: text => (
      <div>{text}</div>
    ),
  },
  {
    title: 'Balance',
    dataIndex: 'balance',
    key: 'balance',
    render: (text, record) => (
      <div>
        {text}
        <Popover
          placement="bottom"
          title={
            <div>
              <div>Wallet balance: {record.fullBalance}</div>
              <div>In orders: {(record.fullBalance - record.balance).toFixed(8)}</div>
            </div>}
        >
          {' '}<Icon type="info-circle-o" />
        </Popover>
      </div>
    ),
  },
  {
    title: 'Tradable',
    key: 'tradable',
    render: (text, record) => (
      <Switch
        className="unlock"
        checked={record.isTradable}
        checkedChildren={<Icon type="check" />}
        onChange={checked => onToggle(checked, record)}
      />
    ),
  },
];

/**
 * List of all user tokens with balance and ability to unlock
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const UserTotalBalance = ({
  tokens,
  onToggle,
  onTokenClick,
  balance,
  wrap,
  unwrap,
  isBalanceLoading,
  isConnected,
}: Props): Node => (
  <div style={{ height: '100%' }}>
    <Overlay isShown={!isConnected}>
      <h3
        style={{
            margin: '20px',
            marginTop: '200px',
            width: '100%',
          }}
      >
      You are viewing this in read-only mode. Connect a wallet to see your balance
      </h3>
    </Overlay>
    <ComponentTitle>My Balance ({balance || 0} ETH)</ComponentTitle>
    <CardContainer id="user-total-balance" bordered={false}>
      <WrapForm wrap={wrap} unwrap={unwrap} onSubmit={() => {}} isLoading={isBalanceLoading} />
      <Card.Grid>
        <TableContainer
          size="small"
          pagination={
            tokens.length <= 17 ? false : { pageSize: 17 }
          }
          bordered={false}
          onRow={record => ({
            onClick: () => onTokenClick(record),
          })}
          dataSource={tokens}
          columns={getColumns(onToggle)}
        />
      </Card.Grid>
    </CardContainer>
  </div>
);

UserTotalBalance.defaultProps = {
  onToggle: () => {},
  onTokenClick: () => {},
  wrap: () => {},
  unwrap: () => {},
};

export default UserTotalBalance;
