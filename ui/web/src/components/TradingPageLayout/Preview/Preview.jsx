// @flow
import React from 'react';

import type {
  Node,
} from 'react';

import TradingPageLayout from '..';

import {
  DottedBorder,
} from './styled';

type Props = {
  hideRest: boolean,
};

const components = [
  'assetPairCard',
  'tradingHistory',
  'balance',
  'userOrders',
  'chart',
  'orderBook',
  'buySell',
  'news',
];

/* Capitalize firts letter */
function cfl(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const TradingPageLayoutPreview = (props: Props): Node => (
  <TradingPageLayout>
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
  </TradingPageLayout>
);

export default TradingPageLayoutPreview;
