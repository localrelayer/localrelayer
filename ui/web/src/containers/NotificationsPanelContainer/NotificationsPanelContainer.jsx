// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import Component from 'web-components/ConnectComponent';
import NotificationsPanel from 'web-components/NotificationsPanel';

import {
  uiActions,
} from 'web-actions';
import {
  getUiState,
  getNotifications,
} from 'web-selectors';


const NotificationsPanelContainer = (): Node => (
  <Component
    mapStateToProps={state => ({
      visible: getUiState('isNotificationsPanelIsVisible')(state),
      notifications: getNotifications(state),
    })}
  >
    {({
      visible,
      notifications,
      dispatch,
    }) => (
      <NotificationsPanel
        visible={visible}
        notifications={notifications}
        onClose={() => {
          dispatch(uiActions.setUiState({
            isNotificationsPanelIsVisible: !visible,
          }));
        }}
      />
    )}
  </Component>
);

export default NotificationsPanelContainer;
