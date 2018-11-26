// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import UserProfileLayout from '..';

import {
  DottedBorder,
} from './styled';

type Props = {
  hideRest: boolean,
};

const components = [
  'userTradingHistory',
  'userBalance',
  'userOrders',
];

/* Capitalize firts letter */
function cfl(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const UserProfileLayoutPreview = (props: Props): Node => (
  <UserProfileLayout>
    {components.map(c => (
      props[c]
        ? (
          <div key={c}>
            {props[c]}
          </div>
        )
        : (
          <DottedBorder
            key={c}
            style={{
              ...(
                props.hideRest ? { display: 'none' } : {}
              ),
            }}
          >
            {`<${cfl(c)} />`}
          </DottedBorder>
        )
    ))}
  </UserProfileLayout>
);

export default UserProfileLayoutPreview;
