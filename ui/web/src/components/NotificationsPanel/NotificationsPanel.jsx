// @flow
import React from 'react';
import {
  Drawer,
  Icon,
  Timeline
} from 'antd';
import * as S from './styled';

type Props = {
  visible: Boolean,
  notifications: any,
  onClose: Function,
};

const NotificationsPanel = ({
  visible,
  notifications,
  onClose,
}: Props) => (
  <Drawer
    closable
    title="Notifications panel"
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
          <S.NotificationItemContent>
            <div>
              {notification.description}
            </div>
            <div>
              {notification.metaData?.asset?.name}
            </div>
            <div>
              {new Date(notification.createdAt).toLocaleString()}
            </div>
            <S.NotificationItemStatus statuscolor={notification.color}>
              {notification.statusDescription}
            </S.NotificationItemStatus>
          </S.NotificationItemContent>
        </Timeline.Item>))}
    </Timeline>
  </Drawer>
);

export default NotificationsPanel;
