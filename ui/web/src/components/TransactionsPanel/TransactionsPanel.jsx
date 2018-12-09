// @flow
import React from 'react';
import {
  Drawer,
  Icon,
  Timeline,
} from 'antd';
import {
  utils,
} from 'instex-core';
import * as S from './styled';

type Props = {
  visible: Boolean,
  notifications: any,
  onClose: Function,
  networkId: Number,
};

const TransactionsPanel = ({
  visible,
  notifications,
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
      {notifications.map(notification => (
        <Timeline.Item
          key={notification.id}
          color={notification.color}
          dot={notification.statusDescription === 'Pending'
          && (
            <Icon
              spin
              type="loading"
              style={{ fontSize: 14, color: `${notification.color}` }}
            />
          )}
        >
          <S.TransactionItemContent>
            <div>
              {notification.name}
              {' '}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={`https://${networkId === 42 ? 'kovan.' : ''}etherscan.io/tx/${notification.transactionHash}`}
              >
                (
                {notification.transactionHash.slice(0, 6)}
)
              </a>
            </div>
            <div>
              {notification.meta?.asset?.name}
            </div>
            <div>
              {notification.completedAt
                ? utils.formatDate('MM/DD HH:mm:ss', notification.completedAt)
                : utils.formatDate('MM/DD HH:mm:ss', notification.createdAt)
              }
            </div>
            <S.TransactionItemStatus statuscolor={notification.color}>
              {notification.statusDescription}
            </S.TransactionItemStatus>
          </S.TransactionItemContent>
        </Timeline.Item>))}
    </Timeline>
  </Drawer>
);

export default TransactionsPanel;
