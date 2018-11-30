// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import UserProfilePageLayout from '..';

import {
  DottedBorder,
} from './styled';

type Props = {
  hideRest: boolean,
};

const components = [
  'tradingHistory',
  'userBalance',
  'userOpenOrders',
];

/* Capitalize firts letter */
function cfl(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const UserProfilePageLayoutPreview = (props: Props): Node => (
  <UserProfilePageLayout>
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
  </UserProfilePageLayout>
);

export default UserProfilePageLayoutPreview;
