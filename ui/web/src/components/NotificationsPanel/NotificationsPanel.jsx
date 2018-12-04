// @flow
import React from 'react';
import {
  Drawer,
  Timeline,
} from 'antd';


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
        >
          <div style={{ color: 'white' }}>
            {notification.description}
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  </Drawer>
);

export default NotificationsPanel;
