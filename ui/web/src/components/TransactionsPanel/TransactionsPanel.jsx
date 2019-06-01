// @flow
import React from 'react';
import {
  Drawer,
  Icon,
  Timeline,
} from 'antd';
import {
  utils,
} from 'localrelayer-core';
import * as S from './styled';

type Props = {
  visible: Boolean,
  transactions: any,
  onClose: Function,
  networkId: Number,
};

const TransactionsPanel = ({
  visible,
  transactions,
  onClose,
  networkId,
}: Props) => (
  <Drawer
    closable
    title="Transactions panel"
    placement="right"
    onClose={onClose}
    visible={visible}
  >
    <Timeline>
      {transactions.map(tr => (
        <Timeline.Item
          key={tr.id}
          color={tr.color}
          dot={tr.statusDescription === 'Pending'
          && (
            <Icon
              spin
              type="loading"
              style={{ fontSize: 14, color: `${tr.color}` }}
            />
          )}
        >
          <S.TransactionItemContent>
            <div>
              {tr.name}
              {' '}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={`https://${networkId === 42 ? 'kovan.' : ''}etherscan.io/tx/${tr.transactionHash}`}
              >
                (
                {tr.transactionHash.slice(0, 6)}
)
              </a>
            </div>
            { tr.name === 'Fill' && (
              <div>
                <div>
                  {`Pair: ${tr.meta?.pair}`}
                </div>
                <div>
                  {`Price: ${tr.meta?.price}`}
                </div>
              </div>
            )
            }
            <div>
              {tr.meta?.asset?.name}
            </div>
            <div>
              {utils.formatDate(
                'MM/DD HH:mm:ss',
                tr.completedA || tr.createdAt,
              )}
            </div>
            <S.TransactionItemStatus statuscolor={tr.color}>
              {tr.statusDescription}
            </S.TransactionItemStatus>
          </S.TransactionItemContent>
        </Timeline.Item>))}
    </Timeline>
  </Drawer>
);

export default TransactionsPanel;
